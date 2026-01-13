/**
 * SEO 工具函数测试
 */

import {
  generateArticleJsonLd,
  generateWebsiteJsonLd,
  generateBreadcrumbJsonLd,
  generateFAQJsonLd,
  secondsToISO8601Duration,
  combineJsonLd,
} from '@/lib/seo'

// Mock siteConfig
jest.mock('@/config/site', () => ({
  siteConfig: {
    name: 'Test Blog',
    description: 'A test blog',
    url: 'https://test.com',
    locale: 'zh-CN',
    author: {
      name: 'Test Author',
      email: 'test@test.com',
      github: 'https://github.com/test',
      twitter: 'https://twitter.com/test',
    },
    nav: [
      { name: '首页', href: '/' },
      { name: '博客', href: '/blog' },
    ],
  },
}))

describe('SEO Utils', () => {
  describe('generateArticleJsonLd', () => {
    it('should generate valid article JSON-LD', () => {
      const result = generateArticleJsonLd({
        title: 'Test Article',
        description: 'Test description',
        datePublished: '2024-01-01',
        url: 'https://test.com/blog/test',
        tags: ['test', 'article'],
        category: 'Technology',
      })

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@type']).toBe('BlogPosting')
      expect(result.headline).toBe('Test Article')
      expect(result.description).toBe('Test description')
      expect(result.datePublished).toBe('2024-01-01')
      expect(result.keywords).toBe('test, article')
      expect(result.articleSection).toBe('Technology')
    })

    it('should include reading time when provided', () => {
      const result = generateArticleJsonLd({
        title: 'Test Article',
        description: 'Test description',
        datePublished: '2024-01-01',
        url: 'https://test.com/blog/test',
        readingTime: 5,
      })

      expect(result.timeRequired).toBe('PT5M')
    })

    it('should use datePublished as dateModified when not provided', () => {
      const result = generateArticleJsonLd({
        title: 'Test Article',
        description: 'Test description',
        datePublished: '2024-01-01',
        url: 'https://test.com/blog/test',
      })

      expect(result.dateModified).toBe('2024-01-01')
    })
  })

  describe('generateWebsiteJsonLd', () => {
    it('should generate valid website JSON-LD', () => {
      const result = generateWebsiteJsonLd()

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@type']).toBe('WebSite')
      expect(result.name).toBe('Test Blog')
      expect(result.url).toBe('https://test.com')
      expect(result.potentialAction).toBeDefined()
    })
  })

  describe('generateBreadcrumbJsonLd', () => {
    it('should generate valid breadcrumb JSON-LD', () => {
      const items = [
        { name: '首页', url: 'https://test.com' },
        { name: '博客', url: 'https://test.com/blog' },
        { name: '文章', url: 'https://test.com/blog/article' },
      ]

      const result = generateBreadcrumbJsonLd(items)

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@type']).toBe('BreadcrumbList')
      expect(result.itemListElement).toHaveLength(3)
      expect(result.itemListElement[0].position).toBe(1)
      expect(result.itemListElement[1].position).toBe(2)
      expect(result.itemListElement[2].position).toBe(3)
    })
  })

  describe('generateFAQJsonLd', () => {
    it('should generate valid FAQ JSON-LD', () => {
      const faqs = [
        { question: 'What is this?', answer: 'This is a test.' },
        { question: 'How does it work?', answer: 'It works well.' },
      ]

      const result = generateFAQJsonLd(faqs)

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@type']).toBe('FAQPage')
      expect(result.mainEntity).toHaveLength(2)
      expect(result.mainEntity[0]['@type']).toBe('Question')
      expect(result.mainEntity[0].acceptedAnswer['@type']).toBe('Answer')
    })
  })

  describe('secondsToISO8601Duration', () => {
    it('should convert seconds to ISO 8601 duration', () => {
      expect(secondsToISO8601Duration(0)).toBe('PT0S')
      expect(secondsToISO8601Duration(30)).toBe('PT30S')
      expect(secondsToISO8601Duration(60)).toBe('PT1M')
      expect(secondsToISO8601Duration(90)).toBe('PT1M30S')
      expect(secondsToISO8601Duration(3600)).toBe('PT1H')
      expect(secondsToISO8601Duration(3661)).toBe('PT1H1M1S')
    })
  })

  describe('combineJsonLd', () => {
    it('should combine multiple schemas into @graph', () => {
      const schema1 = { '@context': 'https://schema.org', '@type': 'Article', name: 'Test' }
      const schema2 = { '@context': 'https://schema.org', '@type': 'Person', name: 'Author' }

      const result = combineJsonLd(schema1, schema2)

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@graph']).toHaveLength(2)
      expect(result['@graph'][0]['@type']).toBe('Article')
      expect(result['@graph'][1]['@type']).toBe('Person')
      // @context should be removed from individual schemas
      expect(result['@graph'][0]['@context']).toBeUndefined()
    })
  })
})
