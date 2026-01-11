'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Calendar, Clock } from 'lucide-react'

interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  category: string
  coverImage?: string
}

interface SeriesPost {
  id: string
  postSlug: string
  order: number
  post: PostMeta | null
}

interface Series {
  id: string
  name: string
  slug: string
  description: string | null
  coverImage: string | null
  color: string | null
  posts: SeriesPost[]
}

interface SeriesDetailClientProps {
  series: Series
}

export default function SeriesDetailClient({ series }: SeriesDetailClientProps) {
  const validPosts = series.posts.filter((sp) => sp.post !== null)

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/series"
            className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回系列列表
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Cover */}
          {series.coverImage && (
            <div
              className="h-48 rounded-xl mb-6 bg-cover bg-center"
              style={{ backgroundImage: `url(${series.coverImage})` }}
            />
          )}

          <h1
            className="text-3xl md:text-4xl font-cyber font-bold mb-4"
            style={{ color: 'var(--accent-primary)' }}
          >
            {series.name}
          </h1>

          {series.description && (
            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
              {series.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {validPosts.length} 篇文章
            </span>
          </div>
        </motion.div>

        {/* Posts List */}
        <div className="space-y-4">
          {validPosts.map((sp, index) => (
            <motion.div
              key={sp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/blog/${sp.postSlug}`}>
                <div
                  className="group relative rounded-xl p-6 transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Order Number */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-cyber font-bold"
                      style={{
                        backgroundColor: series.color || 'var(--accent-primary)',
                        color: 'var(--bg-primary)',
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-lg font-bold mb-2 group-hover:text-[var(--accent-primary)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {sp.post!.title}
                      </h2>
                      <p
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {sp.post!.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {sp.post!.date}
                        </span>
                        {sp.post!.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            {sp.post!.tags.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      boxShadow: `0 0 20px ${series.color || 'var(--accent-primary)'}30`,
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {validPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>该系列暂无文章</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
