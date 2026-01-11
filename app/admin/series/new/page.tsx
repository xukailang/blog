'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewSeriesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#00f0ff',
    isPublished: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/admin/series')
      }
    } catch (error) {
      console.error('Failed to create series:', error)
    } finally {
      setLoading(false)
    }
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
          新建系列
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
              placeholder="输入系列名称"
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
              placeholder="输入系列描述"
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
              立即发布
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-cyber transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
          }}
        >
          <Save className="w-4 h-4" />
          {loading ? '创建中...' : '创建系列'}
        </button>
      </form>
    </div>
  )
}
