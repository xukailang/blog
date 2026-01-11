'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, Trash2, Calendar } from 'lucide-react'

interface Favorite {
  id: string
  postSlug: string
  createdAt: string
}

interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  category: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [posts, setPosts] = useState<Record<string, PostMeta>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data)

        // 获取文章详情
        const postsData: Record<string, PostMeta> = {}
        for (const fav of data) {
          try {
            const postRes = await fetch(`/api/posts/${fav.postSlug}`)
            if (postRes.ok) {
              const post = await postRes.json()
              postsData[fav.postSlug] = post
            }
          } catch {
            // 忽略错误
          }
        }
        setPosts(postsData)
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (slug: string) => {
    try {
      const res = await fetch(`/api/favorites/${slug}`, { method: 'POST' })
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.postSlug !== slug))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
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
          <h1
            className="text-3xl font-cyber font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            我的收藏
          </h1>
        </motion.div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Bookmark className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>暂无收藏</p>
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
            {favorites.map((fav, index) => {
              const post = posts[fav.postSlug]
              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl p-4 flex items-start justify-between gap-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <Link href={`/blog/${fav.postSlug}`} className="flex-1 min-w-0 group">
                    <h3
                      className="font-bold mb-1 group-hover:text-[var(--accent-primary)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {post?.title || fav.postSlug}
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
                        <Calendar className="w-3 h-3" />
                        收藏于 {new Date(fav.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(fav.postSlug)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                    title="取消收藏"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
