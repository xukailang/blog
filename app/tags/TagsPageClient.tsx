'use client'

import { motion } from 'framer-motion'
import GlitchText from '@/components/ui/GlitchText'
import TagCloud from '@/components/blog/TagCloud'
import NeonBorder from '@/components/effects/NeonBorder'

interface TagsPageClientProps {
  tags: { name: string; count: number }[]
}

export default function TagsPageClient({ tags }: TagsPageClientProps) {
  const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0)

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
            text="TAGS"
            as="h1"
            className="text-4xl md:text-5xl font-bold text-cyber-cyan mb-4"
          />
          <p className="text-gray-500 font-mono">
            共 {tags.length} 个标签，{totalPosts} 篇文章
          </p>
        </motion.div>

        {/* Tag Cloud */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NeonBorder color="cyan" className="p-8 bg-cyber-dark/30">
            <TagCloud tags={tags} maxTags={50} />
          </NeonBorder>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: '总标签数', value: tags.length },
            { label: '最热标签', value: tags[0]?.name || '-' },
            { label: '最热标签文章数', value: tags[0]?.count || 0 },
            { label: '平均每标签文章', value: tags.length ? Math.round(totalPosts / tags.length) : 0 },
          ].map((stat, index) => (
            <NeonBorder
              key={stat.label}
              color={index % 2 === 0 ? 'cyan' : 'pink'}
              className="p-4 bg-cyber-dark/30 text-center"
            >
              <p className="text-2xl font-cyber text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 font-mono">{stat.label}</p>
            </NeonBorder>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
