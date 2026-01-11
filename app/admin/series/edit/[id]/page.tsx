'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'

interface SeriesPost {
  id: string
  postSlug: string
  order: number
}

interface Series {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  isPublished: boolean
  posts: SeriesPost[]
}

interface Props {
  params: Promise<{ id: string }>
}

export default function EditSeriesPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [series, setSeries] = useState<Series | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#00f0ff',
    isPublished: true,
  })
  const [newPostSlug, setNewPostSlug] = useState('')

  useEffect(() => {
    fetchSeries()
  }, [id])

  const fetchSeries = async () => {
    try {
      const res = await fetch(`/api/admin/series/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSeries(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          color: data.color || '#00f0ff',
          isPublished: data.isPublished,
        })
      }
    } catch (error) {
      console.error('Failed to fetch series:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/series/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/admin/series')
      }
    } catch (error) {
      console.error('Failed to update series:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddPost = async () => {
    if (!newPostSlug.trim()) return

    try {
      const res = await fetch(`/api/admin/series/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug: newPostSlug }),
      })

      if (res.ok) {
        setNewPostSlug('')
        fetchSeries()
      }
    } catch (error) {
      console.error('Failed to add post:', error)
    }
  }

  const handleRemovePost = async (postSlug: string) => {
    try {
      const res = await fetch(`/api/admin/series/${id}/posts?postSlug=${postSlug}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchSeries()
      }
    } catch (error) {
      console.error('Failed to remove post:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent-primary)]" />
      </div>
    )
  }

  if (!series) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>系列不存在</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/series"
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </Link>
        <h1 className="text-2xl font-cyber font-bold" style={{ color: 'var(--accent-primary)' }}>
          编辑系列
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              系列名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-1"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-1 resize-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              rows={3}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              主题色
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-1 font-mono"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isPublished" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              已发布
            </label>
          </div>
        </div>

        {/* Posts Management */}
        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            系列文章
          </h2>

          {/* Add Post */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPostSlug}
              onChange={(e) => setNewPostSlug(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-1"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="输入文章 slug"
            />
            <button
              type="button"
              onClick={handleAddPost}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-2">
            {series.posts.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                暂无文章，输入文章 slug 添加
              </p>
            ) : (
              series.posts
                .sort((a, b) => a.order - b.order)
                .map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <GripVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: formData.color,
                        color: 'var(--bg-primary)',
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                      {post.postSlug}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePost(post.postSlug)}
                      className="p-1 rounded hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || !formData.name.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-cyber transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
          }}
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存更改'}
        </button>
      </form>
    </div>
  )
}
