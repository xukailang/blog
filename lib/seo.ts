import { siteConfig } from '@/config/site'

// ============ 类型定义 ============

export interface ArticleJsonLdProps {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  images?: string[]
  tags?: string[]
  category?: string
  readingTime?: number
  wordCount?: number
}

export interface FAQItem {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
  image?: string
  url?: string
}

export interface VideoJsonLdProps {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string // ISO 8601 格式，如 "PT1M30S"
  contentUrl?: string
  embedUrl?: string
}

// ============ 文章相关 ============

export function generateArticleJsonLd(props: ArticleJsonLdProps) {
  const {
    title,
    description,
    datePublished,
    dateModified,
    url,
    images,
    tags,
    category,
    readingTime,
    wordCount,
  } = props

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
    ...(readingTime && { timeRequired: `PT${readingTime}M` }),
    ...(wordCount && { wordCount: wordCount }),
    inLanguage: siteConfig.locale,
  }
}

// ============ 网站相关 ============

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: siteConfig.locale,
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

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.author.github,
      siteConfig.author.twitter,
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.author.email,
      contactType: 'customer service',
    },
  }
}

// ============ 人物相关 ============

export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.url,
    email: siteConfig.author.email,
    jobTitle: 'Software Developer',
    sameAs: [
      siteConfig.author.github,
      siteConfig.author.twitter,
    ].filter(Boolean),
    image: `${siteConfig.url}/avatar.png`,
  }
}

// ============ 导航相关 ============

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

export function generateSiteNavigationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: siteConfig.name,
    url: siteConfig.url,
    hasPart: siteConfig.nav.map((item) => ({
      '@type': 'WebPage',
      name: item.name,
      url: `${siteConfig.url}${item.href}`,
    })),
  }
}

// ============ 系列/列表相关 ============

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

export function generateBlogListJsonLd(posts: {
  title: string
  url: string
  datePublished: string
  description: string
}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} - 博客`,
    description: siteConfig.description,
    url: `${siteConfig.url}/blog`,
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: post.url,
      datePublished: post.datePublished,
      description: post.description,
      author: {
        '@type': 'Person',
        name: siteConfig.author.name,
      },
    })),
  }
}

// ============ FAQ 相关 ============

export function generateFAQJsonLd(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// ============ HowTo 相关 ============

export function generateHowToJsonLd(howTo: {
  name: string
  description: string
  totalTime?: string // ISO 8601 格式
  steps: HowToStep[]
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    ...(howTo.totalTime && { totalTime: howTo.totalTime }),
    ...(howTo.image && { image: howTo.image }),
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url }),
    })),
  }
}

// ============ 视频相关 ============

export function generateVideoJsonLd(video: VideoJsonLdProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    ...(video.duration && { duration: video.duration }),
    ...(video.contentUrl && { contentUrl: video.contentUrl }),
    ...(video.embedUrl && { embedUrl: video.embedUrl }),
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
    },
  }
}

// ============ 软件/代码相关 ============

export function generateSoftwareJsonLd(software: {
  name: string
  description: string
  url: string
  applicationCategory?: string
  operatingSystem?: string
  programmingLanguage?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: software.name,
    description: software.description,
    url: software.url,
    ...(software.applicationCategory && { applicationCategory: software.applicationCategory }),
    ...(software.operatingSystem && { operatingSystem: software.operatingSystem }),
    ...(software.programmingLanguage && { programmingLanguage: software.programmingLanguage }),
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
    },
  }
}

// ============ 评论相关 ============

export function generateCommentJsonLd(comments: {
  author: string
  text: string
  dateCreated: string
}[]) {
  return comments.map((comment) => ({
    '@type': 'Comment',
    author: {
      '@type': 'Person',
      name: comment.author,
    },
    text: comment.text,
    dateCreated: comment.dateCreated,
  }))
}

// ============ 组合 JSON-LD ============

export function combineJsonLd(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map((schema) => {
      // 移除单独的 @context，因为我们在顶层定义了
      const { '@context': _, ...rest } = schema as { '@context'?: string }
      return rest
    }),
  }
}

// ============ 辅助函数 ============

// 将秒数转换为 ISO 8601 时长格式
export function secondsToISO8601Duration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  let duration = 'PT'
  if (hours > 0) duration += `${hours}H`
  if (minutes > 0) duration += `${minutes}M`
  if (secs > 0 || duration === 'PT') duration += `${secs}S`

  return duration
}

// 生成文章的完整 JSON-LD（包含面包屑）
export function generateFullArticleJsonLd(
  article: ArticleJsonLdProps,
  breadcrumbs?: { name: string; url: string }[]
) {
  const schemas = [generateArticleJsonLd(article)]

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbJsonLd(breadcrumbs) as object)
  }

  return combineJsonLd(...schemas)
}
