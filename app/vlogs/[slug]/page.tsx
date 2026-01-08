'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Vlog {
  id: string
  title: string
  slug: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  duration: number | null
  viewCount: number
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
}

export default function VlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const [vlog, setVlog] = useState<Vlog | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    fetchVlog()
  }, [slug])

  const fetchVlog = async () => {
    try {
      const res = await fetch(`/api/vlogs/${slug}`)
      if (!res.ok) {
        router.push('/vlogs')
        return
      }
      const data = await res.json()
      setVlog(data.vlog)
      setLikeCount(data.vlog._count.likes)
    } catch {
      router.push('/vlogs')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatViews = (count: number) => {
    if (count < 1000) return count.toString()
    if (count < 10000) return `${(count / 1000).toFixed(1)}K`
    return `${Math.floor(count / 10000)}万`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-cyan-400">加载中...</div>
      </div>
    )
  }

  if (!vlog) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/vlogs"
          className="inline-flex items-center text-gray-400 hover:text-cyan-400 mb-6 transition-colors"
        >
          ← 返回列表
        </Link>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black rounded-lg overflow-hidden mb-6"
        >
          <video
            src={vlog.videoUrl}
            poster={vlog.thumbnailUrl || undefined}
            controls
            autoPlay
            className="w-full aspect-video"
          />
        </motion.div>

        {/* Video Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h1 className="text-2xl font-bold text-white mb-4">{vlog.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span>{formatViews(vlog.viewCount)} 次播放</span>
            <span>·</span>
            <span>{formatDate(vlog.createdAt)}</span>
            <span>·</span>
            <span>{likeCount} 赞</span>
          </div>

          {vlog.description && (
            <p className="text-gray-300 whitespace-pre-wrap">{vlog.description}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => {
                setLiked(!liked)
                setLikeCount(liked ? likeCount - 1 : likeCount + 1)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                liked
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {liked ? '已赞' : '点赞'}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('链接已复制')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              分享
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
