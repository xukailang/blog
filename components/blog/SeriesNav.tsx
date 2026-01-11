'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'

interface SeriesPost {
  postSlug: string
  order: number
}

interface SeriesNavProps {
  series: {
    name: string
    slug: string
    color: string | null
    posts: SeriesPost[]
  }
  currentIndex: number
  totalPosts: number
  prevPost: SeriesPost | null
  nextPost: SeriesPost | null
  postTitles?: Record<string, string>
}

export default function SeriesNav({
  series,
  currentIndex,
  totalPosts,
  prevPost,
  nextPost,
  postTitles = {},
}: SeriesNavProps) {
  const themeColor = series.color || 'var(--accent-primary)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${themeColor}20, transparent)`,
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Link
          href={`/series/${series.slug}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <BookOpen className="w-4 h-4" style={{ color: themeColor }} />
          <span className="font-cyber text-sm" style={{ color: themeColor }}>
            {series.name}
          </span>
        </Link>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {currentIndex + 1} / {totalPosts}
        </span>
      </div>

      {/* Navigation */}
      <div className="p-4 flex items-center justify-between gap-4">
        {/* Previous */}
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.postSlug}`}
            className="flex-1 group flex items-center gap-2 p-3 rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
          >
            <ChevronLeft
              className="w-5 h-5 flex-shrink-0 transition-transform group-hover:-translate-x-1"
              style={{ color: 'var(--text-muted)' }}
            />
            <div className="min-w-0">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                上一篇
              </div>
              <div
                className="text-sm font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {postTitles[prevPost.postSlug] || prevPost.postSlug}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {/* Divider */}
        <div
          className="w-px h-12 flex-shrink-0"
          style={{ backgroundColor: 'var(--border-color)' }}
        />

        {/* Next */}
        {nextPost ? (
          <Link
            href={`/blog/${nextPost.postSlug}`}
            className="flex-1 group flex items-center justify-end gap-2 p-3 rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
          >
            <div className="min-w-0 text-right">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                下一篇
              </div>
              <div
                className="text-sm font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {postTitles[nextPost.postSlug] || nextPost.postSlug}
              </div>
            </div>
            <ChevronRight
              className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: 'var(--text-muted)' }}
            />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </motion.div>
  )
}
