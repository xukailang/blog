'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PostMeta } from '@/lib/mdx'

interface Stats {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalPosts: number
}

interface PostStats {
  [slug: string]: {
    viewCount: number
    likeCount: number
    commentCount: number
  }
}

export default function AdminPage() {
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [drafts, setDrafts] = useState<PostMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'drafts'>('posts')
  const [stats, setStats] = useState<Stats | null>(null)
  const [postStats, setPostStats] = useState<PostStats>({})
  const [pendingComments, setPendingComments] = useState(0)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const res = await fetch('/api/admin/auth/check')
    const data = await res.json()
    if (!data.authenticated) {
      router.push('/admin/login')
      return
    }
    fetchData()
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [postsRes, draftsRes, statsRes, postStatsRes, commentsRes] = await Promise.all([
        fetch('/api/admin/posts'),
        fetch('/api/admin/drafts'),
        fetch('/api/admin/stats?type=overview'),
        fetch('/api/admin/stats?type=posts'),
        fetch('/api/admin/comments?pending=true'),
      ])
      const postsData = await postsRes.json()
      const draftsData = await draftsRes.json()
      const statsData = await statsRes.json()
      const postStatsData = await postStatsRes.json()
      const commentsData = await commentsRes.json()

      setPosts(postsData.posts || [])
      setDrafts(draftsData.drafts || [])
      setStats(statsData.stats || null)
      setPostStats(postStatsData.postStats || {})
      setPendingComments(commentsData.comments?.length || 0)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string, isDraft: boolean) => {
    if (!confirm('确定要删除吗？')) return

    const endpoint = isDraft ? `/api/admin/drafts/${slug}` : `/api/admin/posts/${slug}`
    const res = await fetch(endpoint, { method: 'DELETE' })

    if (res.ok) {
      fetchData()
    } else {
      alert('删除失败')
    }
  }

  const handlePublish = async (slug: string) => {
    const res = await fetch(`/api/admin/drafts/${slug}/publish`, { method: 'POST' })

    if (res.ok) {
      fetchData()
      setActiveTab('posts')
    } else {
      alert('发布失败')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-400">加载中...</div>
      </div>
    )
  }

  const currentList = activeTab === 'posts' ? posts : drafts

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400">博客管理后台</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              查看博客
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors text-sm"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">{stats.totalPosts}</div>
              <div className="text-sm text-gray-400">文章总数</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{stats.totalViews}</div>
              <div className="text-sm text-gray-400">总浏览量</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-pink-400">{stats.totalLikes}</div>
              <div className="text-sm text-gray-400">总点赞数</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalComments}</div>
              <div className="text-sm text-gray-400">总评论数</div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/admin/vlogs"
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg transition-colors border border-cyan-600"
          >
            Vlog 管理
          </Link>
          <Link
            href="/admin/categories"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
          >
            分类管理
          </Link>
          <Link
            href="/admin/comments"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
          >
            评论管理
            {pendingComments > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full">
                {pendingComments}
              </span>
            )}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'posts'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              已发布 ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'drafts'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              草稿 ({drafts.length})
            </button>
          </div>
          <Link
            href="/admin/new"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            + 新建文章
          </Link>
        </div>

        {/* List */}
        {currentList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {activeTab === 'posts' ? '暂无已发布文章' : '暂无草稿'}
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((item) => {
              const itemStats = postStats[item.slug]
              return (
                <div
                  key={item.slug}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-1">
                        {item.description || '暂无描述'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatDate(item.date)}</span>
                        <span>{item.category}</span>
                        {item.tags.length > 0 && (
                          <span>{item.tags.join(', ')}</span>
                        )}
                        {activeTab === 'posts' && itemStats && (
                          <>
                            <span className="text-green-400">
                              {itemStats.viewCount} 浏览
                            </span>
                            <span className="text-pink-400">
                              {itemStats.likeCount} 点赞
                            </span>
                            <span className="text-yellow-400">
                              {itemStats.commentCount} 评论
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {activeTab === 'drafts' && (
                        <button
                          onClick={() => handlePublish(item.slug)}
                          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                        >
                          发布
                        </button>
                      )}
                      <Link
                        href={`/admin/preview/${item.slug}?type=${activeTab === 'drafts' ? 'draft' : 'post'}`}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                      >
                        预览
                      </Link>
                      <Link
                        href={`/admin/edit/${item.slug}?type=${activeTab === 'drafts' ? 'draft' : 'post'}`}
                        className="px-3 py-1 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(item.slug, activeTab === 'drafts')}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
