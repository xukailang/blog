'use client'

import { motion } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import { useReadingMode } from '@/hooks/useReadingMode'
import { cn } from '@/lib/utils'

interface ReadingModeToggleProps {
  className?: string
}

export default function ReadingModeToggle({ className }: ReadingModeToggleProps) {
  const { isReadingMode, toggleReadingMode, mounted } = useReadingMode()

  if (!mounted) return null

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleReadingMode}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-mono text-sm',
        isReadingMode
          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
          : 'border-cyber-cyan/30 text-gray-400 hover:border-cyber-cyan hover:text-cyber-cyan',
        className
      )}
      title={isReadingMode ? '退出阅读模式' : '进入阅读模式'}
    >
      {isReadingMode ? (
        <>
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">退出阅读模式</span>
        </>
      ) : (
        <>
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">阅读模式</span>
        </>
      )}
    </motion.button>
  )
}
