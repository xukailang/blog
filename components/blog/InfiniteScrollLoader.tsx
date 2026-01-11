'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollLoaderProps {
  isLoading: boolean
  hasMore: boolean
  loadedCount: number
  totalCount: number
}

export default function InfiniteScrollLoader({
  isLoading,
  hasMore,
  loadedCount,
  totalCount
}: InfiniteScrollLoaderProps) {
  if (!hasMore && loadedCount > 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-gray-500 font-mono text-sm">
          已加载全部 {totalCount} 篇文章
        </p>
        <div className="mt-2 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-8 gap-3"
      >
        <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
        <p className="text-gray-500 font-mono text-sm">
          加载更多文章...
        </p>
      </motion.div>
    )
  }

  return null
}
