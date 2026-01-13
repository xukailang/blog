/**
 * JsonLd 组件测试
 */

import { render } from '@testing-library/react'
import JsonLd, { MultiJsonLd } from '@/components/seo/JsonLd'

describe('JsonLd Component', () => {
  it('should render JSON-LD script tag', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
    }

    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    expect(script?.innerHTML).toBe(JSON.stringify(data))
  })

  it('should handle complex nested data', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
      author: {
        '@type': 'Person',
        name: 'Test Author',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Test Publisher',
        logo: {
          '@type': 'ImageObject',
          url: 'https://example.com/logo.png',
        },
      },
    }

    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    const parsed = JSON.parse(script?.innerHTML || '{}')
    expect(parsed.author.name).toBe('Test Author')
    expect(parsed.publisher.logo.url).toBe('https://example.com/logo.png')
  })

  it('should handle array data', () => {
    const data = [
      { '@type': 'Article', headline: 'Article 1' },
      { '@type': 'Article', headline: 'Article 2' },
    ]

    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    const parsed = JSON.parse(script?.innerHTML || '[]')
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(2)
  })
})

describe('MultiJsonLd Component', () => {
  it('should render multiple JSON-LD script tags', () => {
    const items = [
      { '@context': 'https://schema.org', '@type': 'Article', headline: 'Article 1' },
      { '@context': 'https://schema.org', '@type': 'Person', name: 'Author' },
    ]

    const { container } = render(<MultiJsonLd items={items} />)
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')

    expect(scripts).toHaveLength(2)
  })

  it('should render each item as separate script', () => {
    const items = [
      { '@type': 'Article', headline: 'Test 1' },
      { '@type': 'Article', headline: 'Test 2' },
      { '@type': 'Article', headline: 'Test 3' },
    ]

    const { container } = render(<MultiJsonLd items={items} />)
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')

    expect(scripts).toHaveLength(3)

    scripts.forEach((script, index) => {
      const parsed = JSON.parse(script.innerHTML)
      expect(parsed.headline).toBe(`Test ${index + 1}`)
    })
  })
})
