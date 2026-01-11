'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag, ChevronRight } from 'lucide-react'
import { PostMeta } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import NeonBorder from '@/components/effects/NeonBorder'

interface TimelineProps {
  posts: PostMeta[]
}

interface GroupedPosts {
  year: number
  months: {
    month: number
    monthName: string
    posts: PostMeta[]
  }[]
}

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]

export default function Timeline({ posts }: TimelineProps) {
  const groupedPosts = useMemo(() => {
    const groups: Map<number, Map<number, PostMeta[]>> = new Map()

    posts.forEach(post => {
      const date = new Date(post.date)
      const year = date.getFullYear()
      const month = date.getMonth()

      if (!groups.has(year)) {
        groups.set(year, new Map())
      }

      const yearGroup = groups.get(year)!
      if (!yearGroup.has(month)) {
        yearGroup.set(month, [])
      }

      yearGroup.get(month)!.push(post)
    })

    // Convert to array and sort
    const result: GroupedPosts[] = []

    Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0]) // Sort years descending
      .forEach(([year, months]) => {
        const monthsArray = Array.from(months.entries())
          .sort((a, b) => b[0] - a[0]) // Sort months descending
          .map(([month, posts]) => ({
            month,
            monthName: monthNames[month],
            posts: posts.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          }))

        result.push({ year, months: monthsArray })
      })

    return result
  }, [posts])

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-cyan via-cyber-pink to-cyber-purple" />

      {groupedPosts.map((yearGroup, yearIndex) => (
        <div key={yearGroup.year} className="mb-12">
          {/* Year marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: yearIndex * 0.1 }}
            className="relative flex justify-center mb-8"
          >
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyber-cyan shadow-lg shadow-cyber-cyan/50" />
            <span className="ml-12 md:ml-0 px-6 py-2 bg-cyber-dark border border-cyber-cyan/50 rounded-full font-cyber text-2xl text-cyber-cyan">
              {yearGroup.year}
            </span>
          </motion.div>

          {yearGroup.months.map((monthGroup, monthIndex) => (
            <div key={`${yearGroup.year}-${monthGroup.month}`} className="mb-8">
              {/* Month marker */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: yearIndex * 0.1 + monthIndex * 0.05 }}
                className="relative flex items-center mb-4 ml-12 md:ml-0 md:justify-center"
              >
                <div className="absolute left-[-32px] md:left-1/2 md:-translate-x-1/2 w-2 h-2 rounded-full bg-cyber-pink" />
                <span className="text-sm font-mono text-cyber-pink">
                  {monthGroup.monthName}
                </span>
              </motion.div>

              {/* Posts */}
              <div className="space-y-4">
                {monthGroup.posts.map((post, postIndex) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: yearIndex * 0.1 + monthIndex * 0.05 + postIndex * 0.03,
                    }}
                    className={`relative ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                      postIndex % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    }`}
                  >
                    {/* Connector dot */}
                    <div
                      className={`absolute top-6 w-2 h-2 rounded-full bg-gray-600 ${
                        postIndex % 2 === 0
                          ? 'left-[-36px] md:left-auto md:right-[-5px]'
                          : 'left-[-36px] md:left-[-5px]'
                      }`}
                    />

                    <Link href={`/blog/${post.slug}`}>
                      <NeonBorder
                        color={postIndex % 2 === 0 ? 'cyan' : 'pink'}
                        className="block p-4 bg-cyber-dark/50 hover:bg-cyber-dark/70 transition-all duration-300 group"
                      >
                        <div className="flex gap-4">
                          {post.coverImage && (
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-cyber uppercase tracking-wider text-cyber-pink">
                                {post.category}
                              </span>
                            </div>
                            <h3 className="text-white font-medium line-clamp-2 group-hover:text-cyber-cyan transition-colors mb-2">
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
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyber-cyan transition-colors flex-shrink-0" />
                        </div>
                      </NeonBorder>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
