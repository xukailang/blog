import { MeiliSearch, Index } from 'meilisearch'

// Meilisearch 配置
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || ''

// 创建 Meilisearch 客户端
export const meiliClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
})

// 索引名称
export const POSTS_INDEX = 'posts'

// 文章文档类型
export interface PostDocument {
  id: string
  slug: string
  title: string
  description: string
  content: string
  tags: string[]
  category: string
  date: string
  readingTime: number
  createdAt: number // 用于排序的时间戳
}

// 搜索结果类型
export interface MeiliSearchResult {
  slug: string
  title: string
  description: string
  category: string
  date: string
  tags: string[]
  highlights: {
    title?: string
    description?: string
    content?: string
  }
  score: number
}

// 获取或创建索引
export async function getPostsIndex(): Promise<Index<PostDocument>> {
  try {
    return await meiliClient.getIndex(POSTS_INDEX)
  } catch {
    // 索引不存在，创建新索引
    await meiliClient.createIndex(POSTS_INDEX, { primaryKey: 'id' })
    const index = await meiliClient.getIndex(POSTS_INDEX)

    // 配置索引设置
    await index.updateSettings({
      // 可搜索的属性（按优先级排序）
      searchableAttributes: [
        'title',
        'description',
        'tags',
        'category',
        'content',
      ],
      // 可过滤的属性
      filterableAttributes: ['category', 'tags', 'date'],
      // 可排序的属性
      sortableAttributes: ['createdAt', 'date'],
      // 显示的属性
      displayedAttributes: [
        'slug',
        'title',
        'description',
        'category',
        'date',
        'tags',
        'content',
      ],
      // 排名规则
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
      // 停用词（中文搜索通常不需要）
      stopWords: [],
      // 同义词
      synonyms: {},
      // 分词设置 - 支持中文
      // Meilisearch 默认支持中文分词
    })

    return index
  }
}

// 添加或更新文章到索引
export async function indexPost(post: PostDocument): Promise<void> {
  const index = await getPostsIndex()
  await index.addDocuments([post])
}

// 批量添加文章到索引
export async function indexPosts(posts: PostDocument[]): Promise<void> {
  const index = await getPostsIndex()
  await index.addDocuments(posts)
}

// 从索引中删除文章
export async function removePostFromIndex(slug: string): Promise<void> {
  const index = await getPostsIndex()
  await index.deleteDocument(slug)
}

// 搜索文章
export async function searchPosts(
  query: string,
  options: {
    limit?: number
    offset?: number
    filter?: string
    sort?: string[]
  } = {}
): Promise<{
  results: MeiliSearchResult[]
  total: number
  took: number
  query: string
}> {
  const { limit = 10, offset = 0, filter, sort } = options

  const index = await getPostsIndex()
  const startTime = Date.now()

  const searchResult = await index.search(query, {
    limit,
    offset,
    filter,
    sort,
    attributesToHighlight: ['title', 'description', 'content'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['content'],
    cropLength: 150,
    showMatchesPosition: true,
  })

  const results: MeiliSearchResult[] = searchResult.hits.map((hit) => {
    const formatted = hit._formatted || {}

    return {
      slug: hit.slug,
      title: hit.title,
      description: hit.description,
      category: hit.category,
      date: hit.date,
      tags: hit.tags,
      highlights: {
        title: formatted.title !== hit.title ? formatted.title : undefined,
        description: formatted.description !== hit.description ? formatted.description : undefined,
        content: formatted.content,
      },
      score: hit._rankingScore || 0,
    }
  })

  return {
    results,
    total: searchResult.estimatedTotalHits || results.length,
    took: Date.now() - startTime,
    query,
  }
}

// 获取搜索建议
export async function getSearchSuggestions(
  query: string,
  limit = 5
): Promise<string[]> {
  const index = await getPostsIndex()

  const searchResult = await index.search(query, {
    limit,
    attributesToRetrieve: ['title', 'tags', 'category'],
  })

  const suggestions = new Set<string>()

  for (const hit of searchResult.hits) {
    // 添加匹配的标题
    if (hit.title.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(hit.title)
    }
    // 添加匹配的标签
    for (const tag of hit.tags) {
      if (tag.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(tag)
      }
    }
    // 添加匹配的分类
    if (hit.category.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(hit.category)
    }

    if (suggestions.size >= limit) break
  }

  return Array.from(suggestions).slice(0, limit)
}

// 获取热门搜索词（基于搜索历史，需要额外实现）
export async function getPopularSearches(limit = 5): Promise<string[]> {
  // 这里可以从数据库或缓存中获取热门搜索词
  // 暂时返回空数组，后续可以实现
  return []
}

// 检查 Meilisearch 服务是否可用
export async function checkMeilisearchHealth(): Promise<boolean> {
  try {
    const health = await meiliClient.health()
    return health.status === 'available'
  } catch {
    return false
  }
}

// 获取索引统计信息
export async function getIndexStats(): Promise<{
  numberOfDocuments: number
  isIndexing: boolean
} | null> {
  try {
    const index = await getPostsIndex()
    const stats = await index.getStats()
    return {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
    }
  } catch {
    return null
  }
}
