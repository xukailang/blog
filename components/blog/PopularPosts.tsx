'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Eye, Heart, Flame } from 'lucide-react'
import { PostMeta } from '@/lib/mdx'
import NeonBorder from '@/components/effects/NeonBorder'

interface PopularPost extends PostMeta {
  viewCount: number
  likeCount: number
  score: number
}

interface PopularPostsProps {
  limit?: number
  period?: 'all' | 'week' | 'month'
  showTitle?: boolean
  className?: string
}

export default function PopularPosts({
  limit = 5,
  period = 'all',
  showTitle = true,
  className = '',
}: PopularPostsProps) {
  const [posts, setPosts] = useState<PopularPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activePeriod, setActivePeriod] = useState(period)

  useEffect(() => {
    async function fetchPopularPosts() {
      setLoading(true)
      try {
        const res = await fetch(`/api/posts/popular?limit=${limit}&period=${activePeriod}`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts)
        }
      } catch (error) {
        console.error('Failed to fetch popular posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularPosts()
  }, [limit, activePeriod])

  const periodLabels = {
    all: '全部',
    week: '本周',
    month: '本月',
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-cyber font-bold text-cyber-pink flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            热门文章
          </h2>
          <div className="flex gap-1">
            {(['all', 'month', 'week'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  activePeriod === p
                    ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/50'
                    : 'text-gray-500 hover:text-cyber-pink'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-cyber-dark/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center py-8 font-mono">
          暂无热门文章
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <NeonBorder
                  color={index < 3 ? 'pink' : 'cyan'}
                  className="block p-3 bg-cyber-dark/30 hover:bg-cyber-dark/50 transition-all duration-300 group"
                >
                  <div className="flex gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-cyber font-bold text-sm ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                          : index === 2
                          ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                          : 'bg-cyber-dark border border-cyber-cyan/30 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-white font-medium line-clamp-2 group-hover:text-cyber-cyan transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likeCount}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {post.coverImage && (
                      <div className="relative w-16 h-12 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                </NeonBorder>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <Link
          href="/blog"
          className="block text-center mt-4 text-sm text-gray-500 hover:text-cyber-cyan transition-colors font-mono"
        >
          查看全部文章 →
        </Link>
      )}
    </div>
  )
}
