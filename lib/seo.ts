import { siteConfig } from '@/config/site'

export interface ArticleJsonLdProps {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  images?: string[]
  tags?: string[]
  category?: string
}

export function generateArticleJsonLd(props: ArticleJsonLdProps) {
  const { title, description, datePublished, dateModified, url, images, tags, category } = props

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    url: url,
    image: images && images.length > 0 ? images : [`${siteConfig.url}/og-image.png`],
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(tags && tags.length > 0 && { keywords: tags.join(', ') }),
    ...(category && { articleSection: category }),
  }
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.url,
    sameAs: [
      siteConfig.author.github,
      siteConfig.author.twitter,
    ].filter(Boolean),
  }
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateSeriesJsonLd(series: {
  name: string
  description?: string
  url: string
  posts: { title: string; url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: series.name,
    description: series.description,
    url: series.url,
    numberOfItems: series.posts.length,
    itemListElement: series.posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: post.title,
      url: post.url,
    })),
  }
}
