'use client'

import { motion } from 'framer-motion'
import { PostMeta } from '@/lib/mdx'
import GlitchText from '@/components/ui/GlitchText'
import Timeline from '@/components/blog/Timeline'

interface TimelinePageClientProps {
  posts: PostMeta[]
}

export default function TimelinePageClient({ posts }: TimelinePageClientProps) {
  // Calculate stats
  const years = new Set(posts.map(p => new Date(p.date).getFullYear())).size
  const categories = new Set(posts.map(p => p.category)).size

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <GlitchText
            text="TIMELINE"
            as="h1"
            className="text-4xl md:text-5xl font-bold text-cyber-cyan mb-4"
          />
          <p className="text-gray-500 font-mono">
            {posts.length} 篇文章 · {years} 年 · {categories} 个分类
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {posts.length > 0 ? (
            <Timeline posts={posts} />
          ) : (
            <div className="text-center py-20 text-gray-500 font-mono">
              暂无文章
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
