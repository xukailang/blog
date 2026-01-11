'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Tag } from 'lucide-react'

interface TagCloudProps {
  tags: { name: string; count: number }[]
  maxTags?: number
  className?: string
}

export default function TagCloud({ tags, maxTags = 30, className = '' }: TagCloudProps) {
  const processedTags = useMemo(() => {
    // Sort by count and take top tags
    const sortedTags = [...tags].sort((a, b) => b.count - a.count).slice(0, maxTags)

    // Calculate min and max counts for scaling
    const counts = sortedTags.map(t => t.count)
    const minCount = Math.min(...counts)
    const maxCount = Math.max(...counts)
    const range = maxCount - minCount || 1

    // Assign sizes based on count
    return sortedTags.map(tag => {
      const normalized = (tag.count - minCount) / range
      // Size from 0.75rem to 1.5rem
      const fontSize = 0.75 + normalized * 0.75
      // Opacity from 0.6 to 1
      const opacity = 0.6 + normalized * 0.4

      return {
        ...tag,
        fontSize,
        opacity,
      }
    }).sort(() => Math.random() - 0.5) // Shuffle for visual variety
  }, [tags, maxTags])

  if (tags.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 font-mono ${className}`}>
        暂无标签
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {processedTags.map((tag, index) => (
        <motion.div
          key={tag.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
        >
          <Link
            href={`/blog?tag=${encodeURIComponent(tag.name)}`}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyber-cyan/30 bg-cyber-dark/50 hover:bg-cyber-cyan/10 hover:border-cyber-cyan transition-all duration-300"
            style={{
              fontSize: `${tag.fontSize}rem`,
              opacity: tag.opacity,
            }}
          >
            <Tag
              className="text-cyber-cyan group-hover:text-cyber-pink transition-colors"
              style={{ width: `${tag.fontSize * 0.8}rem`, height: `${tag.fontSize * 0.8}rem` }}
            />
            <span className="text-gray-300 group-hover:text-white transition-colors">
              {tag.name}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              ({tag.count})
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

// Compact version for sidebars
export function TagCloudCompact({ tags, maxTags = 15, className = '' }: TagCloudProps) {
  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => b.count - a.count).slice(0, maxTags)
  }, [tags, maxTags])

  if (tags.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {sortedTags.map((tag) => (
        <Link
          key={tag.name}
          href={`/blog?tag=${encodeURIComponent(tag.name)}`}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-cyber-cyan/20 bg-cyber-dark/30 text-gray-400 hover:text-cyber-cyan hover:border-cyber-cyan/50 transition-colors font-mono"
        >
          #{tag.name}
          <span className="text-gray-600">({tag.count})</span>
        </Link>
      ))}
    </div>
  )
}

// 3D Tag Cloud (more visual)
export function TagCloud3D({ tags, maxTags = 20, className = '' }: TagCloudProps) {
  const processedTags = useMemo(() => {
    const sortedTags = [...tags].sort((a, b) => b.count - a.count).slice(0, maxTags)
    const counts = sortedTags.map(t => t.count)
    const minCount = Math.min(...counts)
    const maxCount = Math.max(...counts)
    const range = maxCount - minCount || 1

    return sortedTags.map((tag, index) => {
      const normalized = (tag.count - minCount) / range
      const fontSize = 0.7 + normalized * 0.8

      // Calculate position in a sphere-like distribution
      const phi = Math.acos(-1 + (2 * index) / sortedTags.length)
      const theta = Math.sqrt(sortedTags.length * Math.PI) * phi

      const x = Math.cos(theta) * Math.sin(phi) * 40
      const y = Math.sin(theta) * Math.sin(phi) * 40
      const z = Math.cos(phi) * 20

      return {
        ...tag,
        fontSize,
        x,
        y,
        z,
        opacity: 0.5 + (z + 20) / 40 * 0.5,
      }
    })
  }, [tags, maxTags])

  if (tags.length === 0) return null

  return (
    <div className={`relative h-64 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {processedTags.map((tag) => (
          <motion.div
            key={tag.name}
            className="absolute"
            style={{
              transform: `translate(${tag.x}%, ${tag.y}%)`,
              zIndex: Math.round(tag.z + 20),
            }}
            whileHover={{ scale: 1.2, zIndex: 100 }}
          >
            <Link
              href={`/blog?tag=${encodeURIComponent(tag.name)}`}
              className="whitespace-nowrap px-2 py-1 rounded text-gray-300 hover:text-cyber-cyan transition-colors"
              style={{
                fontSize: `${tag.fontSize}rem`,
                opacity: tag.opacity,
              }}
            >
              {tag.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
