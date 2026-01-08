'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SplitEditor from '@/components/admin/SplitEditor'
import PostForm from '@/components/admin/PostForm'

export default function NewPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  const [draftSlug, setDraftSlug] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const res = await fetch('/api/admin/auth/check')
    const data = await res.json()
    if (!data.authenticated) {
      router.push('/admin/login')
    }
  }

  const saveDraft = useCallback(async () => {
    if (!formData.title && !content) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: draftSlug,
          ...formData,
          content,
        }),
      })

      const data = await res.json()
      if (res.ok && data.slug) {
        setDraftSlug(data.slug)
      }
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setSaving(false)
    }
  }, [formData, content, draftSlug])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || content) {
        saveDraft()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [saveDraft, formData.title, content])

  const handlePublish = async () => {
    if (!formData.title) {
      alert('请输入标题')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content,
        }),
      })

      if (res.ok) {
        // Delete draft if exists
        if (draftSlug) {
          await fetch(`/api/admin/drafts/${draftSlug}`, { method: 'DELETE' })
        }
        router.push('/admin')
      } else {
        const data = await res.json()
        alert(data.error || '发布失败')
      }
    } catch {
      alert('发布失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.title) {
      alert('请输入标题')
      return
    }

    await saveDraft()
    alert('草稿已保存')
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
            <h1 className="text-lg font-medium text-white">新建文章</h1>
            {saving && (
              <span className="text-sm text-gray-500">保存中...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              保存草稿
            </button>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布'}
            </button>
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
