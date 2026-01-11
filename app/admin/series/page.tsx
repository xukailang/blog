'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff } from 'lucide-react'

interface Series {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  isPublished: boolean
  _count: {
    posts: number
  }
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      const res = await fetch('/api/admin/series')
      if (res.ok) {
        const data = await res.json()
        setSeries(data)
      }
    } catch (error) {
      console.error('Failed to fetch series:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个系列吗？')) return

    try {
      const res = await fetch(`/api/admin/series/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSeries(series.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete series:', error)
    }
  }

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/series/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      })
      if (res.ok) {
        setSeries(series.map((s) => (s.id === id ? { ...s, isPublished: !isPublished } : s)))
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent-primary)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-cyber font-bold" style={{ color: 'var(--accent-primary)' }}>
          系列管理
        </h1>
        <Link
          href="/admin/series/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-cyber text-sm transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
          }}
        >
          <Plus className="w-4 h-4" />
          新建系列
        </Link>
      </div>

      {/* Series List */}
      {series.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>暂无系列，点击上方按钮创建</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {series.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-4 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-center gap-4">
                {/* Color Indicator */}
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color || 'var(--accent-primary)' }}
                />

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </h3>
                    {!item.isPublished && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        未发布
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {item._count.posts} 篇文章 · /{item.slug}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(item.id, item.isPublished)}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                  title={item.isPublished ? '取消发布' : '发布'}
                >
                  {item.isPublished ? (
                    <Eye className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  ) : (
                    <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>
                <Link
                  href={`/admin/series/edit/${item.id}`}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                >
                  <Edit className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
