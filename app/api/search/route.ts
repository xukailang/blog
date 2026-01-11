import { NextRequest, NextResponse } from 'next/server'
import { buildSearchIndex, search, getSuggestions } from '@/lib/search/search'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

let searchIndex: ReturnType<typeof buildSearchIndex> | null = null

function getSearchIndex() {
  if (!searchIndex) {
    searchIndex = buildSearchIndex()
  }
  return searchIndex
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

  if (!query.trim()) {
    return NextResponse.json({ results: [], total: 0, query: '' })
  }

  const startTime = Date.now()
  const index = getSearchIndex()

  if (type === 'suggestions') {
    const suggestions = getSuggestions(query, index, limit)
    const response = NextResponse.json({ suggestions })
    return addRateLimitHeaders(response, remaining, resetTime, 'search')
  }

  const allResults = search(query, index)
  const results = allResults.slice(offset, offset + limit)
  const took = Date.now() - startTime

  const response = NextResponse.json({
    results,
    total: allResults.length,
    query,
    took,
  })

  return addRateLimitHeaders(response, remaining, resetTime, 'search')
}
