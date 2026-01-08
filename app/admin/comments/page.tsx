'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  postSlug: string
  guestName: string | null
  guestEmail: string | null
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    avatar: string | null
  } | null
}

export default function CommentsPage() {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending'>('pending')

  useEffect(() => {
    checkAuthAndFetch()
  }, [filter])

  const checkAuthAndFetch = async () => {
    const authRes = await fetch('/api/admin/auth/check')
    const authData = await authRes.json()
    if (!authData.authenticated) {
      router.push('/admin/login')
      return
    }
    fetchComments()
  }

  const fetchComments = async () => {
    setLoading(true)
    try {
      const url = filter === 'pending'
        ? '/api/admin/comments?pending=true'
        : '/api/admin/comments'
      const res = await fetch(url)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (res.ok) {
        fetchComments()
      } else {
        alert('操作失败')
      }
    } catch {
      alert('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return

    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchComments()
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <h1 className="text-lg font-medium text-white">评论管理</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            待审核
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            全部评论
          </button>
        </div>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {filter === 'pending' ? '暂无待审核评论' : '暂无评论'}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {comment.user ? (
                        <>
                          {comment.user.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-white text-xs">
                              {(comment.user.name || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-white text-sm">
                            {comment.user.name || '用户'}
                          </span>
                          <span className="text-xs text-cyan-400">已注册</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                            {(comment.guestName || 'G')[0].toUpperCase()}
                          </div>
                          <span className="text-white text-sm">
                            {comment.guestName || '游客'}
                          </span>
                          {comment.guestEmail && (
                            <span className="text-xs text-gray-500">
                              {comment.guestEmail}
                            </span>
                          )}
                        </>
                      )}
                      {!comment.isApproved && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-600/20 text-yellow-400 rounded">
                          待审核
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(comment.createdAt)}</span>
                      <Link
                        href={`/blog/${comment.postSlug}`}
                        className="text-cyan-400 hover:underline"
                      >
                        查看文章
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!comment.isApproved && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                      >
                        通过
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
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
