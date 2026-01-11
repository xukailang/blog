'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, History, Trash2, Clock } from 'lucide-react'

interface ReadingHistory {
  id: string
  postSlug: string
  readAt: string
  progress: number
}

interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  category: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([])
  const [posts, setPosts] = useState<Record<string, PostMeta>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/reading-history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)

        // 获取文章详情
        const postsData: Record<string, PostMeta> = {}
        for (const item of data) {
          try {
            const postRes = await fetch(`/api/posts/${item.postSlug}`)
            if (postRes.ok) {
              const post = await postRes.json()
              postsData[item.postSlug] = post
            }
          } catch {
            // 忽略错误
          }
        }
        setPosts(postsData)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeHistory = async (slug: string) => {
    try {
      const res = await fetch(`/api/reading-history/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        setHistory(history.filter((h) => h.postSlug !== slug))
      }
    } catch (error) {
      console.error('Failed to remove history:', error)
    }
  }

  const clearAllHistory = async () => {
    if (!confirm('确定要清空所有阅读历史吗？')) return

    try {
      const res = await fetch('/api/reading-history', { method: 'DELETE' })
      if (res.ok) {
        setHistory([])
      }
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:text-[var(--accent-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回个人中心
          </Link>
          <div className="flex items-center justify-between">
            <h1
              className="text-3xl font-cyber font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              阅读历史
            </h1>
            {history.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="text-sm px-3 py-1 rounded-lg transition-colors hover:bg-red-500/10 text-red-500"
              >
                清空历史
              </button>
            )}
          </div>
        </motion.div>

        {/* History List */}
        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <History className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>暂无阅读历史</p>
            <Link
              href="/blog"
              className="inline-block mt-4 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              去看看文章
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const post = posts[item.postSlug]
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/blog/${item.postSlug}`} className="flex-1 min-w-0 group">
                      <h3
                        className="font-bold mb-1 group-hover:text-[var(--accent-primary)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {post?.title || item.postSlug}
                      </h3>
                      {post?.description && (
                        <p
                          className="text-sm mb-2 line-clamp-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {post.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.readAt)}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => removeHistory(item.postSlug)}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                      title="删除记录"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {item.progress > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>阅读进度</span>
                        <span style={{ color: 'var(--accent-primary)' }}>{Math.round(item.progress)}%</span>
                      </div>
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.progress}%`,
                            backgroundColor: 'var(--accent-primary)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
