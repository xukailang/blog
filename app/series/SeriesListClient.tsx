'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

interface Series {
  id: string
  name: string
  slug: string
  description: string | null
  coverImage: string | null
  color: string | null
  _count: {
    posts: number
  }
}

interface SeriesListClientProps {
  series: Series[]
}

export default function SeriesListClient({ series }: SeriesListClientProps) {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl md:text-5xl font-cyber font-bold mb-4 glitch"
            data-text="文章系列"
            style={{ color: 'var(--accent-primary)' }}
          >
            文章系列
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            系统学习，深入探索每个主题
          </p>
        </motion.div>

        {/* Series Grid */}
        {series.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>暂无文章系列</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/series/${item.slug}`}>
                  <div
                    className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {/* Cover Image or Gradient */}
                    <div
                      className="h-32 relative"
                      style={{
                        background: item.coverImage
                          ? `url(${item.coverImage}) center/cover`
                          : `linear-gradient(135deg, ${item.color || 'var(--accent-primary)'}, var(--accent-secondary))`,
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-secondary))' }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 -mt-8 relative">
                      <h2
                        className="text-xl font-cyber font-bold mb-2 group-hover:text-[var(--accent-primary)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.name}
                      </h2>
                      {item.description && (
                        <p
                          className="text-sm mb-4 line-clamp-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item._count.posts} 篇文章
                        </span>
                        <ChevronRight
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                          style={{ color: 'var(--accent-primary)' }}
                        />
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        boxShadow: `0 0 30px ${item.color || 'var(--accent-primary)'}40`,
                      }}
                    />
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
