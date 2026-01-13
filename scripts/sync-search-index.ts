/**
 * 同步文章到 Meilisearch 索引
 *
 * 使用方法：
 * npx ts-node scripts/sync-search-index.ts
 * 或
 * npm run sync-search
 */

import { getAllPosts, getPostContent } from '../lib/mdx'
import { indexPosts, getPostsIndex, PostDocument, checkMeilisearchHealth } from '../lib/meilisearch'

// 移除 MDX 标记，提取纯文本
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

async function syncSearchIndex() {
  console.log('🔍 开始同步搜索索引...\n')

  // 检查 Meilisearch 服务是否可用
  const isHealthy = await checkMeilisearchHealth()
  if (!isHealthy) {
    console.error('❌ Meilisearch 服务不可用，请确保服务已启动')
    console.log('\n提示：')
    console.log('1. 安装 Meilisearch: https://docs.meilisearch.com/learn/getting_started/installation.html')
    console.log('2. 启动服务: meilisearch --master-key="your-master-key"')
    console.log('3. 设置环境变量:')
    console.log('   MEILISEARCH_HOST=http://localhost:7700')
    console.log('   MEILISEARCH_API_KEY=your-master-key')
    process.exit(1)
  }

  console.log('✅ Meilisearch 服务连接成功\n')

  // 获取所有文章
  const posts = getAllPosts()
  console.log(`📚 找到 ${posts.length} 篇文章\n`)

  // 转换为搜索文档格式
  const documents: PostDocument[] = posts.map((post) => {
    const rawContent = getPostContent(post.slug)
    const content = stripMdx(rawContent)

    return {
      id: post.slug,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content,
      tags: post.tags,
      category: post.category,
      date: post.date,
      readingTime: post.readingTime,
      createdAt: new Date(post.date).getTime(),
    }
  })

  // 批量索引文章
  console.log('📤 正在上传文章到索引...')
  await indexPosts(documents)

  // 等待索引完成
  const index = await getPostsIndex()
  let isIndexing = true
  let attempts = 0
  const maxAttempts = 30

  while (isIndexing && attempts < maxAttempts) {
    const stats = await index.getStats()
    isIndexing = stats.isIndexing
    if (isIndexing) {
      process.stdout.write('.')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }
  }

  console.log('\n')

  // 获取最终统计
  const finalStats = await index.getStats()
  console.log('✅ 索引同步完成！')
  console.log(`📊 索引统计:`)
  console.log(`   - 文档数量: ${finalStats.numberOfDocuments}`)
  console.log(`   - 索引状态: ${finalStats.isIndexing ? '索引中' : '就绪'}`)
}

// 运行同步
syncSearchIndex().catch((error) => {
  console.error('❌ 同步失败:', error)
  process.exit(1)
})
