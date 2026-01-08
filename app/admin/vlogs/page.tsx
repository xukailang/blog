'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Vlog {
  id: string
  title: string
  slug: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  duration: number | null
  fileSize: number | null
  viewCount: number
  isPublished: boolean
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
}

export default function VlogsAdminPage() {
  const router = useRouter()
  const [vlogs, setVlogs] = useState<Vlog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  const checkAuthAndFetch = async () => {
    const authRes = await fetch('/api/admin/auth/check')
    const authData = await authRes.json()
    if (!authData.authenticated) {
      router.push('/admin/login')
      return
    }
    fetchVlogs()
  }

  const fetchVlogs = async () => {
    try {
      const res = await fetch('/api/admin/vlogs?all=true')
      const data = await res.json()
      setVlogs(data.vlogs || [])
    } catch (error) {
      console.error('Failed to fetch vlogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个视频吗？')) return

    try {
      const res = await fetch(`/api/admin/vlogs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchVlogs()
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/vlogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })
      if (res.ok) {
        fetchVlogs()
      } else {
        alert('操作失败')
      }
    } catch {
      alert('操作失败')
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '--'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN')
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
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <h1 className="text-lg font-medium text-white">Vlog 管理</h1>
          </div>
          <Link
            href="/admin/vlogs/new"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            + 上传视频
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {vlogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无视频，点击上方按钮上传
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vlogs.map((vlog) => (
              <div
                key={vlog.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  {vlog.thumbnailUrl ? (
                    <img
                      src={vlog.thumbnailUrl}
                      alt={vlog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {formatDuration(vlog.duration)}
                  </div>
                  {/* Status badge */}
                  {!vlog.isPublished && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                      草稿
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-1 line-clamp-1">
                    {vlog.title}
                  </h3>
                  {vlog.description && (
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {vlog.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>{formatDate(vlog.createdAt)}</span>
                    <span>{formatFileSize(vlog.fileSize)}</span>
                    <span>{vlog.viewCount} 播放</span>
                    <span>{vlog._count.likes} 赞</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(vlog.id, vlog.isPublished)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        vlog.isPublished
                          ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      {vlog.isPublished ? '取消发布' : '发布'}
                    </button>
                    <Link
                      href={`/admin/vlogs/edit/${vlog.id}`}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(vlog.id)}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
