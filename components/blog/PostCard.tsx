'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'
import { PostMeta } from '@/lib/mdx'
import { formatDate, cn } from '@/lib/utils'
import NeonBorder from '@/components/effects/NeonBorder'

interface PostCardProps {
  post: PostMeta
  index?: number
  disableAnimation?: boolean
}

export default function PostCard({ post, index = 0, disableAnimation = false }: PostCardProps) {
  const colors: ('cyan' | 'pink' | 'purple' | 'green')[] = ['cyan', 'pink', 'purple', 'green']
  const color = colors[index % colors.length]

  const motionProps = disableAnimation
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { delay: index * 0.1 },
        layout: true,
      }

  return (
    <motion.article {...motionProps}>
      <Link href={`/blog/${post.slug}`}>
        <NeonBorder color={color} className="cyber-card p-6 h-full">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent" />
            </div>
          )}

          {/* Category */}
          <div className="mb-3">
            <span className={cn(
              'inline-block px-3 py-1 text-xs font-cyber uppercase tracking-wider rounded-full border',
              color === 'cyan' && 'text-cyber-cyan border-cyber-cyan/50 bg-cyber-cyan/10',
              color === 'pink' && 'text-cyber-pink border-cyber-pink/50 bg-cyber-pink/10',
              color === 'purple' && 'text-cyber-purple border-cyber-purple/50 bg-cyber-purple/10',
              color === 'green' && 'text-cyber-green border-cyber-green/50 bg-cyber-green/10',
            )}>
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-cyber font-bold text-white mb-3 line-clamp-2 group-hover:text-cyber-cyan transition-colors">
            {post.title}
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-3 font-mono">
            {post.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime} 分钟
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs text-gray-500 bg-cyber-dark px-2 py-1 rounded"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Read More */}
          <div className="flex items-center gap-2 text-cyber-cyan text-sm font-cyber group/link">
            <span>阅读更多</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </div>
        </NeonBorder>
      </Link>
    </motion.article>
  )
}
