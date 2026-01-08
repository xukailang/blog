'use client'

import { useState, useEffect } from 'react'
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

export default function VlogsPage() {
  const [vlogs, setVlogs] = useState<Vlog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVlogs()
  }, [])

  const fetchVlogs = async () => {
    try {
      const res = await fetch('/api/vlogs')
      const data = await res.json()
      setVlogs(data.vlogs || [])
    } catch (error) {
      console.error('Failed to fetch vlogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days < 1) return '今天'
    if (days < 7) return `${days} 天前`
    if (days < 30) return `${Math.floor(days / 7)} 周前`
    if (days < 365) return `${Math.floor(days / 30)} 个月前`
    return `${Math.floor(days / 365)} 年前`
  }

  const formatViews = (count: number) => {
    if (count < 1000) return count.toString()
    if (count < 10000) return `${(count / 1000).toFixed(1)}K`
    return `${Math.floor(count / 10000)}万`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vlog</h1>
          <p className="text-gray-400">记录生活的点滴</p>
        </div>

        {/* Video Grid */}
        {vlogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            暂无视频
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vlogs.map((vlog, index) => (
              <motion.div
                key={vlog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/vlogs/${vlog.slug}`}>
                  <div className="group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-900">
                      {vlog.thumbnailUrl ? (
                        <img
                          src={vlog.thumbnailUrl}
                          alt={vlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:text-cyan-500 transition-colors">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                        {formatDuration(vlog.duration)}
                      </div>
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-14 h-14 bg-cyan-500/90 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {vlog.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatViews(vlog.viewCount)} 次播放</span>
                        <span>·</span>
                        <span>{formatDate(vlog.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
