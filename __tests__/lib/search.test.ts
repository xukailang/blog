/**
 * 搜索功能测试
 */

import { buildSearchIndex, search, getSuggestions, SearchablePost } from '@/lib/search/search'

// Mock mdx functions
jest.mock('@/lib/mdx', () => ({
  getAllPosts: jest.fn(() => [
    {
      slug: 'test-post-1',
      title: 'Next.js 入门指南',
      description: '学习 Next.js 的基础知识',
      tags: ['nextjs', 'react', 'javascript'],
      category: '前端开发',
      date: '2024-01-01',
      readingTime: 5,
    },
    {
      slug: 'test-post-2',
      title: 'TypeScript 最佳实践',
      description: 'TypeScript 开发技巧和最佳实践',
      tags: ['typescript', 'javascript'],
      category: '前端开发',
      date: '2024-01-02',
      readingTime: 8,
    },
    {
      slug: 'test-post-3',
      title: 'React Hooks 深入理解',
      description: '深入理解 React Hooks 的工作原理',
      tags: ['react', 'hooks'],
      category: '前端开发',
      date: '2024-01-03',
      readingTime: 10,
    },
  ]),
  getPostContent: jest.fn((slug: string) => {
    const contents: Record<string, string> = {
      'test-post-1': '这是一篇关于 Next.js 的文章，介绍了 Next.js 的基本概念和使用方法。',
      'test-post-2': 'TypeScript 是 JavaScript 的超集，提供了类型系统和更好的开发体验。',
      'test-post-3': 'React Hooks 是 React 16.8 引入的新特性，让函数组件也能使用状态。',
    }
    return contents[slug] || ''
  }),
}))

describe('Search Utils', () => {
  let searchIndex: SearchablePost[]

  beforeAll(() => {
    searchIndex = buildSearchIndex()
  })

  describe('buildSearchIndex', () => {
    it('should build search index from posts', () => {
      expect(searchIndex).toHaveLength(3)
      expect(searchIndex[0].slug).toBe('test-post-1')
      expect(searchIndex[0].title).toBe('Next.js 入门指南')
    })

    it('should strip MDX content', () => {
      // Content should be plain text without MDX syntax
      expect(searchIndex[0].content).not.toContain('```')
      expect(searchIndex[0].content).not.toContain('---')
    })
  })

  describe('search', () => {
    it('should find posts by title', () => {
      const results = search('Next.js', searchIndex)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].slug).toBe('test-post-1')
    })

    it('should find posts by tag', () => {
      const results = search('react', searchIndex)
      expect(results.length).toBeGreaterThan(0)
      // Should find posts with 'react' tag
      const slugs = results.map((r) => r.slug)
      expect(slugs).toContain('test-post-1')
      expect(slugs).toContain('test-post-3')
    })

    it('should find posts by category', () => {
      const results = search('前端', searchIndex)
      expect(results.length).toBe(3) // All posts are in '前端开发' category
    })

    it('should return empty array for no matches', () => {
      const results = search('不存在的内容xyz', searchIndex)
      expect(results).toHaveLength(0)
    })

    it('should return empty array for empty query', () => {
      const results = search('', searchIndex)
      expect(results).toHaveLength(0)
    })

    it('should highlight matching terms', () => {
      const results = search('Next.js', searchIndex)
      expect(results[0].highlights.title).toContain('<mark>')
    })

    it('should sort results by score', () => {
      const results = search('javascript', searchIndex)
      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
      }
    })
  })

  describe('getSuggestions', () => {
    it('should return title suggestions', () => {
      const suggestions = getSuggestions('Next', searchIndex)
      expect(suggestions).toContain('Next.js 入门指南')
    })

    it('should return tag suggestions', () => {
      const suggestions = getSuggestions('type', searchIndex)
      expect(suggestions).toContain('typescript')
    })

    it('should return category suggestions', () => {
      const suggestions = getSuggestions('前端', searchIndex)
      expect(suggestions).toContain('前端开发')
    })

    it('should limit suggestions', () => {
      const suggestions = getSuggestions('a', searchIndex, 2)
      expect(suggestions.length).toBeLessThanOrEqual(2)
    })
  })
})
