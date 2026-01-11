import { getAllPosts } from '@/lib/mdx'
import { siteConfig } from '@/config/site'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateRSSFeed(): string {
  const posts = getAllPosts()

  const items = posts
    .slice(0, 20) // 最新20篇文章
    .map((post) => {
      const postUrl = `${siteConfig.url}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
    })
    .join('')

  const lastBuildDate = posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>${siteConfig.author.email} (${siteConfig.author.name})</managingEditor>
    <webMaster>${siteConfig.author.email} (${siteConfig.author.name})</webMaster>
    ${items}
  </channel>
</rss>`
}

export async function GET() {
  const feed = generateRSSFeed()

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
