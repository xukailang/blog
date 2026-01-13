import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'
import {
  searchPosts as meiliSearch,
  getSearchSuggestions as meiliSuggestions,
  checkMeilisearchHealth,
} from '@/lib/meilisearch'
import { buildSearchIndex, search as memorySearch, getSuggestions as memorySuggestions } from '@/lib/search/search'

// 内存搜索索引（作为回退）
let searchIndex: ReturnType<typeof buildSearchIndex> | null = null

function getSearchIndex() {
  if (!searchIndex) {
    searchIndex = buildSearchIndex()
  }
  return searchIndex
}

// 缓存 Meilisearch 可用状态
let meilisearchAvailable: boolean | null = null
let lastHealthCheck = 0
const HEALTH_CHECK_INTERVAL = 60000 // 1分钟检查一次

async function isMeilisearchAvailable(): Promise<boolean> {
  const now = Date.now()
  if (meilisearchAvailable !== null && now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return meilisearchAvailable
  }

  meilisearchAvailable = await checkMeilisearchHealth()
  lastHealthCheck = now
  return meilisearchAvailable
}

export async function GET(request: NextRequest) {
  // Apply rate limiting for search endpoints
  const { success, remaining, resetTime } = rateLimit(request, 'search')
  if (!success) {
    return createRateLimitResponse(resetTime, 'search')
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')
  const type = searchParams.get('type') || 'search'
  const category = searchParams.get('category') || ''
  const tag = searchParams.get('tag') || ''
  const sort = searchParams.get('sort') || ''

  if (!query.trim()) {
    return NextResponse.json({ results: [], total: 0, query: '' })
  }

  const startTime = Date.now()

  // 检查 Meilisearch 是否可用
  const useMeilisearch = await isMeilisearchAvailable()

  if (useMeilisearch) {
    // 使用 Meilisearch 搜索
    try {
      if (type === 'suggestions') {
        const suggestions = await meiliSuggestions(query, limit)
        const response = NextResponse.json({ suggestions, engine: 'meilisearch' })
        return addRateLimitHeaders(response, remaining, resetTime, 'search')
      }

      // 构建过滤条件
      const filters: string[] = []
      if (category) {
        filters.push(`category = "${category}"`)
      }
      if (tag) {
        filters.push(`tags = "${tag}"`)
      }

      // 构建排序
      const sortOptions: string[] = []
      if (sort === 'date_desc') {
        sortOptions.push('createdAt:desc')
      } else if (sort === 'date_asc') {
        sortOptions.push('createdAt:asc')
      }

      const searchResult = await meiliSearch(query, {
        limit,
        offset,
        filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        sort: sortOptions.length > 0 ? sortOptions : undefined,
      })

      const response = NextResponse.json({
        ...searchResult,
        engine: 'meilisearch',
      })

      return addRateLimitHeaders(response, remaining, resetTime, 'search')
    } catch (error) {
      console.error('Meilisearch search failed, falling back to memory search:', error)
      // 标记 Meilisearch 不可用，下次请求会重新检查
      meilisearchAvailable = false
    }
  }

  // 回退到内存搜索
  const index = getSearchIndex()

  if (type === 'suggestions') {
    const suggestions = memorySuggestions(query, index, limit)
    const response = NextResponse.json({ suggestions, engine: 'memory' })
    return addRateLimitHeaders(response, remaining, resetTime, 'search')
  }

  let allResults = memorySearch(query, index)

  // 应用过滤（内存搜索的简单过滤）
  if (category) {
    allResults = allResults.filter((r) => r.category === category)
  }

  const results = allResults.slice(offset, offset + limit)
  const took = Date.now() - startTime

  const response = NextResponse.json({
    results,
    total: allResults.length,
    query,
    took,
    engine: 'memory',
  })

  return addRateLimitHeaders(response, remaining, resetTime, 'search')
}
