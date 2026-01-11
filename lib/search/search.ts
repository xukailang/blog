import { getAllPosts, getPostContent } from '@/lib/mdx'

export interface SearchablePost {
  slug: string
  title: string
  description: string
  content: string
  tags: string[]
  category: string
  date: string
}

export interface SearchResult {
  slug: string
  title: string
  description: string
  category: string
  date: string
  highlights: {
    title?: string
    content?: string
  }
  score: number
}

function stripMdx(content: string): string {
  return content
    // 移除 frontmatter
    .replace(/^---[\s\S]*?---/m, '')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]+`/g, '')
    // 移除链接
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // 移除 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体/斜体
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 移除列表标记
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 移除引用
    .replace(/^>\s+/gm, '')
    // 压缩空白
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function buildSearchIndex(): SearchablePost[] {
  const posts = getAllPosts()

  return posts.map((post) => {
    const rawContent = getPostContent(post.slug)
    const content = stripMdx(rawContent)

    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      content,
      tags: post.tags,
      category: post.category,
      date: post.date,
    }
  })
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0)
}

function highlightText(text: string, terms: string[], maxLength = 150): string {
  const lowerText = text.toLowerCase()
  let bestStart = 0
  let bestScore = 0

  // 找到最佳匹配位置
  for (let i = 0; i < text.length - maxLength; i += 20) {
    const segment = lowerText.slice(i, i + maxLength)
    let score = 0
    for (const term of terms) {
      if (segment.includes(term)) {
        score += 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestStart = i
    }
  }

  // 调整到单词边界
  while (bestStart > 0 && text[bestStart - 1] !== ' ' && text[bestStart - 1] !== '\n') {
    bestStart--
  }

  let snippet = text.slice(bestStart, bestStart + maxLength)
  if (bestStart > 0) snippet = '...' + snippet
  if (bestStart + maxLength < text.length) snippet = snippet + '...'

  // 高亮匹配词
  for (const term of terms) {
    const regex = new RegExp(`(${term})`, 'gi')
    snippet = snippet.replace(regex, '<mark>$1</mark>')
  }

  return snippet
}

export function search(query: string, index: SearchablePost[]): SearchResult[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const results: SearchResult[] = []

  for (const post of index) {
    let score = 0
    const lowerTitle = post.title.toLowerCase()
    const lowerDesc = post.description.toLowerCase()
    const lowerContent = post.content.toLowerCase()

    for (const term of terms) {
      // 标题匹配权重最高
      if (lowerTitle.includes(term)) {
        score += 10
      }
      // 描述匹配
      if (lowerDesc.includes(term)) {
        score += 5
      }
      // 标签匹配
      if (post.tags.some((tag) => tag.toLowerCase().includes(term))) {
        score += 3
      }
      // 分类匹配
      if (post.category.toLowerCase().includes(term)) {
        score += 2
      }
      // 内容匹配
      const contentMatches = (lowerContent.match(new RegExp(term, 'g')) || []).length
      score += Math.min(contentMatches, 10)
    }

    if (score > 0) {
      results.push({
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        date: post.date,
        highlights: {
          title: terms.some((t) => lowerTitle.includes(t))
            ? highlightText(post.title, terms, post.title.length)
            : undefined,
          content: highlightText(post.content, terms),
        },
        score,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

export function getSuggestions(query: string, index: SearchablePost[], limit = 5): string[] {
  const lowerQuery = query.toLowerCase()
  const suggestions = new Set<string>()

  for (const post of index) {
    // 标题建议
    if (post.title.toLowerCase().includes(lowerQuery)) {
      suggestions.add(post.title)
    }
    // 标签建议
    for (const tag of post.tags) {
      if (tag.toLowerCase().includes(lowerQuery)) {
        suggestions.add(tag)
      }
    }
    // 分类建议
    if (post.category.toLowerCase().includes(lowerQuery)) {
      suggestions.add(post.category)
    }

    if (suggestions.size >= limit) break
  }

  return Array.from(suggestions).slice(0, limit)
}
