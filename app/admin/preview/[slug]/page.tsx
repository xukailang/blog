'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'post'
  const isDraft = type === 'draft'

  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<{
    title: string
    date: string
    description: string
    tags: string[]
    category: string
    coverImage?: string
    content: string
  } | null>(null)

  useEffect(() => {
    checkAuthAndFetch()
  }, [slug, type])

  const checkAuthAndFetch = async () => {
    const authRes = await fetch('/api/admin/auth/check')
    const authData = await authRes.json()
    if (!authData.authenticated) {
      router.push('/admin/login')
      return
    }

    const endpoint = isDraft ? `/api/admin/drafts/${slug}` : `/api/admin/posts/${slug}`
    const res = await fetch(endpoint)

    if (!res.ok) {
      alert('文章不存在')
      router.push('/admin')
      return
    }

    const data = await res.json()
    setPost(isDraft ? data.draft : data.post)
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Simple markdown to HTML converter for preview
  const renderMarkdown = (content: string) => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-cyan-400">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-cyan-300">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 text-cyan-200">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-cyan-500 pl-4 my-4 text-gray-400 italic">$1</blockquote>')
      // Unordered lists
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="border-gray-700 my-8" />')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-4">')

    return `<p class="my-4">${html}</p>`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-cyan-400">加载中...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400">文章不存在</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <span className="text-sm text-gray-500">预览模式</span>
            {isDraft && (
              <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                草稿
              </span>
            )}
          </div>
          <Link
            href={`/admin/edit/${slug}?type=${type}`}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm"
          >
            编辑
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span>{formatDate(post.date)}</span>
          <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-400 rounded">
            {post.category}
          </span>
          {post.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-800 rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        {post.description && (
          <p className="text-gray-400 text-lg mb-8 pb-8 border-b border-gray-800">
            {post.description}
          </p>
        )}

        {/* Content */}
        <article
          className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </main>
    </div>
  )
}
