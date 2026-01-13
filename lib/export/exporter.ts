import { getPostBySlug, Post } from '@/lib/mdx'

// 导出为 Markdown 格式
export function exportToMarkdown(post: Post): string {
  const frontmatter = [
    '---',
    `title: "${post.title}"`,
    `date: "${post.date}"`,
    `description: "${post.description}"`,
    `category: "${post.category}"`,
    `tags:`,
    ...post.tags.map(tag => `  - "${tag}"`),
    post.coverImage ? `coverImage: "${post.coverImage}"` : null,
    '---',
  ].filter(Boolean).join('\n')

  return `${frontmatter}\n\n${post.content}`
}

// 导出为纯文本格式（去除 Markdown 语法）
export function exportToPlainText(post: Post): string {
  let text = post.content

  // 移除代码块
  text = text.replace(/```[\s\S]*?```/g, '')

  // 移除行内代码
  text = text.replace(/`[^`]+`/g, (match) => match.slice(1, -1))

  // 移除图片
  text = text.replace(/!\[.*?\]\(.*?\)/g, '')

  // 转换链接为纯文本
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // 移除标题标记
  text = text.replace(/^#{1,6}\s+/gm, '')

  // 移除粗体和斜体
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')

  // 移除引用标记
  text = text.replace(/^>\s+/gm, '')

  // 移除列表标记
  text = text.replace(/^[-*+]\s+/gm, '• ')
  text = text.replace(/^\d+\.\s+/gm, '')

  // 移除水平线
  text = text.replace(/^---+$/gm, '')

  // 清理多余空行
  text = text.replace(/\n{3,}/g, '\n\n')

  const header = [
    post.title,
    '='.repeat(post.title.length),
    '',
    `日期: ${new Date(post.date).toLocaleDateString('zh-CN')}`,
    `分类: ${post.category}`,
    `标签: ${post.tags.join(', ')}`,
    '',
    post.description,
    '',
    '-'.repeat(40),
    '',
  ].join('\n')

  return header + text.trim()
}

// 生成 HTML 内容（用于 PDF 导出）
export function exportToHtml(post: Post): string {
  // 简单的 Markdown 到 HTML 转换
  let html = post.content

  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
  })

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 粗体和斜体
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // 无序列表
  html = html.replace(/^[-*+] (.+)$/gm, '<li>$1</li>')

  // 段落
  html = html.replace(/\n\n/g, '</p><p>')

  // 水平线
  html = html.replace(/^---+$/gm, '<hr />')

  const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; }
    h2 { font-size: 1.5em; margin-top: 1.5em; }
    h3 { font-size: 1.25em; margin-top: 1.25em; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 2em; }
    .meta span { margin-right: 1em; }
    pre { background: #f5f5f5; padding: 1em; overflow-x: auto; border-radius: 4px; }
    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; }
    img { max-width: 100%; height: auto; }
    a { color: #0066cc; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
  </style>
</head>
<body>
  <article>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="meta">
      <span>日期: ${new Date(post.date).toLocaleDateString('zh-CN')}</span>
      <span>分类: ${escapeHtml(post.category)}</span>
      <span>标签: ${post.tags.map(t => escapeHtml(t)).join(', ')}</span>
    </div>
    <p>${html}</p>
  </article>
</body>
</html>
`

  return fullHtml
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 获取文章并导出
export async function getPostForExport(slug: string) {
  const post = getPostBySlug(slug)
  if (!post) return null

  return {
    markdown: exportToMarkdown(post),
    plainText: exportToPlainText(post),
    html: exportToHtml(post),
    post,
  }
}
