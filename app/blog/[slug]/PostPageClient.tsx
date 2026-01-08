'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag, ArrowLeft, User } from 'lucide-react'
import { Post } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import ReadingProgress from '@/components/blog/ReadingProgress'
import TOC from '@/components/blog/TOC'
import LikeButton from '@/components/blog/LikeButton'
import ShareButtons from '@/components/blog/ShareButtons'
import Comments from '@/components/blog/Comments'
import GlitchText from '@/components/ui/GlitchText'
import NeonBorder from '@/components/effects/NeonBorder'

interface PostPageClientProps {
  post: Post
}

export default function PostPageClient({ post }: PostPageClientProps) {
  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/blog/${post.slug}`
    : `${siteConfig.url}/blog/${post.slug}`

  return (
    <>
      <ReadingProgress />

      <article className="min-h-screen py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-cyber-cyan transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              返回博客
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
            {/* Main Content */}
            <div>
              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                {/* Cover Image */}
                {post.coverImage && (
                  <div className="relative h-64 md:h-96 -mx-4 mb-8 overflow-hidden rounded-lg">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
                  </div>
                )}

                {/* Category */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-cyber uppercase tracking-wider rounded-full border text-cyber-pink border-cyber-pink/50 bg-cyber-pink/10">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <GlitchText
                  text={post.title}
                  as="h1"
                  className="text-3xl md:text-4xl font-bold text-white mb-6"
                />

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-mono mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {siteConfig.author.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readingTime} 分钟阅读
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${tag}`}
                      className="flex items-center gap-1 text-sm text-gray-500 bg-cyber-dark px-3 py-1 rounded-full border border-cyber-cyan/20 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Link>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <LikeButton slug={post.slug} />
                  <ShareButtons title={post.title} url={postUrl} />
                </div>
              </motion.header>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <NeonBorder color="cyan" className="p-6 md:p-8 bg-cyber-dark/30">
                  <div className="prose prose-invert prose-cyber max-w-none">
                    {/* MDX content would be rendered here */}
                    <div
                      className="text-gray-300 leading-relaxed font-mono"
                      dangerouslySetInnerHTML={{
                        __html: post.content
                          .replace(/^# .+$/gm, '')
                          .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-cyber font-bold text-cyber-pink mt-8 mb-4">$1</h2>')
                          .replace(/^### (.+)$/gm, '<h3 class="text-xl font-cyber font-semibold text-cyber-purple mt-6 mb-3">$1</h3>')
                          .replace(/\n\n/g, '</p><p class="mb-4">')
                          .replace(/`([^`]+)`/g, '<code class="bg-cyber-dark px-2 py-1 rounded text-cyber-green font-mono text-sm border border-cyber-cyan/30">$1</code>')
                      }}
                    />
                  </div>
                </NeonBorder>
              </motion.div>

              {/* Comments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Comments />
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <TOC content={post.content} />
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
