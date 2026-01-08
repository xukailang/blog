'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SplitEditor from '@/components/admin/SplitEditor'
import PostForm from '@/components/admin/PostForm'

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'post'
  const isDraft = type === 'draft'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    category: '',
    coverImage: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [content, setContent] = useState('')

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

    // Fetch post/draft data
    const endpoint = isDraft ? `/api/admin/drafts/${slug}` : `/api/admin/posts/${slug}`
    const res = await fetch(endpoint)

    if (!res.ok) {
      alert('文章不存在')
      router.push('/admin')
      return
    }

    const data = await res.json()
    const post = isDraft ? data.draft : data.post

    setFormData({
      title: post.title || '',
      description: post.description || '',
      tags: post.tags || [],
      category: post.category || '',
      coverImage: post.coverImage || '',
      date: post.date ? post.date.split('T')[0] : new Date().toISOString().split('T')[0],
    })
    setContent(post.content || '')
    setLoading(false)
  }

  const saveDraft = useCallback(async () => {
    if (!formData.title && !content) return

    setSaving(true)
    try {
      await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          ...formData,
          content,
        }),
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setSaving(false)
    }
  }, [formData, content, slug])

  // Auto-save for drafts
  useEffect(() => {
    if (!isDraft) return

    const interval = setInterval(() => {
      if (formData.title || content) {
        saveDraft()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [saveDraft, formData.title, content, isDraft])

  const handleSave = async () => {
    if (!formData.title) {
      alert('请输入标题')
      return
    }

    setLoading(true)
    try {
      if (isDraft) {
        // Save draft
        const res = await fetch('/api/admin/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            ...formData,
            content,
          }),
        })

        if (res.ok) {
          alert('草稿已保存')
        } else {
          alert('保存失败')
        }
      } else {
        // Update post
        const res = await fetch(`/api/admin/posts/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            content,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.slug !== slug) {
            router.push(`/admin/edit/${data.slug}?type=post`)
          }
          alert('文章已更新')
        } else {
          alert('更新失败')
        }
      }
    } catch {
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!formData.title) {
      alert('请输入标题')
      return
    }

    setLoading(true)
    try {
      if (isDraft) {
        // First update the draft, then publish
        await fetch('/api/admin/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            ...formData,
            content,
          }),
        })

        const res = await fetch(`/api/admin/drafts/${slug}/publish`, {
          method: 'POST',
        })

        if (res.ok) {
          router.push('/admin')
        } else {
          alert('发布失败')
        }
      } else {
        // Just save the post
        await handleSave()
      }
    } catch {
      alert('发布失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-cyan-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <h1 className="text-lg font-medium text-white">
              编辑{isDraft ? '草稿' : '文章'}
            </h1>
            {saving && (
              <span className="text-sm text-gray-500">保存中...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              保存
            </button>
            {isDraft && (
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                发布
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2">
            <SplitEditor content={content} onChange={setContent} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 sticky top-20">
              <h2 className="text-lg font-medium text-white mb-4">文章信息</h2>
              <PostForm data={formData} onChange={setFormData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
