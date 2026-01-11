'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { PostMeta } from '@/lib/mdx'
import PostCard from '@/components/blog/PostCard'
import GlitchText from '@/components/ui/GlitchText'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import InfiniteScrollLoader from '@/components/blog/InfiniteScrollLoader'

const POSTS_PER_PAGE = 9 // 每次加载的文章数量

interface BlogPageClientProps {
  posts: PostMeta[]
  tags: string[]
  categories: string[]
}

export default function BlogPageClient({ posts, tags, categories }: BlogPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const hasInteracted = useRef(false)

  // 筛选后的文章
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = !selectedTag || post.tags.includes(selectedTag)
      const matchesCategory = !selectedCategory || post.category === selectedCategory

      return matchesSearch && matchesTag && matchesCategory
    })
  }, [posts, searchQuery, selectedTag, selectedCategory])

  // 当前显示的文章
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, displayCount)
  }, [filteredPosts, displayCount])

  // 是否还有更多文章
  const hasMore = displayCount < filteredPosts.length

  // 加载更多文章
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    // 模拟加载延迟，提供更好的用户体验
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + POSTS_PER_PAGE, filteredPosts.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore, filteredPosts.length])

  // 无限滚动 hook
  const { setTarget } = useInfiniteScroll(loadMore, {
    rootMargin: '200px',
    threshold: 0.1
  })

  // 筛选条件变化时重置显示数量
  useEffect(() => {
    setDisplayCount(POSTS_PER_PAGE)
  }, [searchQuery, selectedTag, selectedCategory])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTag(null)
    setSelectedCategory(null)
  }

  const hasActiveFilters = searchQuery || selectedTag || selectedCategory

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <GlitchText
            text="BLOG"
            as="h1"
            className="text-4xl md:text-5xl font-bold text-cyber-cyan mb-4"
          />
          <p className="text-gray-500 font-mono">
            共 {filteredPosts.length} 篇文章
            {hasActiveFilters && ` (筛选自 ${posts.length} 篇)`}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  hasInteracted.current = true
                  setSearchQuery(e.target.value)
                }}
                placeholder="搜索文章..."
                className="w-full bg-cyber-dark border border-cyber-cyan/30 rounded-lg px-4 py-3 pl-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan font-mono"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan'
                  : 'border-cyber-cyan/30 text-gray-400 hover:border-cyber-cyan hover:text-cyber-cyan'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline font-mono">筛选</span>
            </motion.button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-cyber-dark/50 border border-cyber-cyan/20 rounded-lg p-4 mb-4"
            >
              {/* Categories */}
              <div className="mb-4">
                <h3 className="text-sm font-cyber text-cyber-pink mb-2 uppercase tracking-wider">
                  分类
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category ? null : category
                      )}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors font-mono ${
                        selectedCategory === category
                          ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink'
                          : 'border-gray-600 text-gray-400 hover:border-cyber-pink hover:text-cyber-pink'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-cyber text-cyber-cyan mb-2 uppercase tracking-wider">
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(
                        selectedTag === tag ? null : tag
                      )}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors font-mono ${
                        selectedTag === tag
                          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                          : 'border-gray-600 text-gray-400 hover:border-cyber-cyan hover:text-cyber-cyan'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 font-mono">当前筛选:</span>
              {searchQuery && (
                <span className="px-2 py-1 bg-cyber-dark border border-cyber-cyan/30 rounded text-sm text-cyber-cyan font-mono flex items-center gap-1">
                  搜索: {searchQuery}
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="px-2 py-1 bg-cyber-dark border border-cyber-pink/30 rounded text-sm text-cyber-pink font-mono flex items-center gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="px-2 py-1 bg-cyber-dark border border-cyber-cyan/30 rounded text-sm text-cyber-cyan font-mono flex items-center gap-1">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-cyber-pink transition-colors font-mono"
              >
                清除全部
              </button>
            </div>
          )}
        </motion.div>

        {/* Posts Grid */}
        {displayedPosts.length > 0 ? (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPosts.map((post, index) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    index={index}
                    disableAnimation={hasInteracted.current}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* 加载更多触发器 */}
            {hasMore && <div ref={setTarget} className="w-full h-4 mt-4" />}

            {/* 加载状态指示器 */}
            <InfiniteScrollLoader
              isLoading={isLoading}
              hasMore={hasMore}
              loadedCount={displayedPosts.length}
              totalCount={filteredPosts.length}
            />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-500 font-mono text-lg mb-4">
              没有找到匹配的文章
            </p>
            <button
              onClick={clearFilters}
              className="text-cyber-cyan hover:text-cyber-pink transition-colors font-mono"
            >
              清除筛选条件
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
