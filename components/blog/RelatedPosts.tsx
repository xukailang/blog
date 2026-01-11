'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag } from 'lucide-react'
import { PostMeta } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import NeonBorder from '@/components/effects/NeonBorder'

interface RelatedPostsProps {
  posts: PostMeta[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-cyber font-bold text-cyber-cyan mb-8 flex items-center gap-3">
          <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" />
          相关推荐
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <NeonBorder
                  color="cyan"
                  className="block p-4 bg-cyber-dark/50 hover:bg-cyber-dark/70 transition-all duration-300 group"
                >
                  <div className="flex gap-4">
                    {post.coverImage && (
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 text-xs font-cyber uppercase tracking-wider rounded border text-cyber-pink border-cyber-pink/50 bg-cyber-pink/10 mb-2">
                        {post.category}
                      </span>
                      <h3 className="text-white font-semibold line-clamp-2 group-hover:text-cyber-cyan transition-colors mb-2">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readingTime} 分钟
                        </span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 text-xs text-gray-500 bg-cyber-black/50 px-2 py-0.5 rounded"
                            >
                              <Tag className="w-2 h-2" />
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-xs text-gray-600">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </NeonBorder>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
