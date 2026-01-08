'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NeonBorderProps {
  children: ReactNode
  className?: string
  color?: 'cyan' | 'pink' | 'purple' | 'green'
  animate?: boolean
}

const colorMap = {
  cyan: {
    border: 'border-cyber-cyan',
    shadow: 'shadow-cyber-cyan/50',
    glow: 'hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]',
  },
  pink: {
    border: 'border-cyber-pink',
    shadow: 'shadow-cyber-pink/50',
    glow: 'hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]',
  },
  purple: {
    border: 'border-cyber-purple',
    shadow: 'shadow-cyber-purple/50',
    glow: 'hover:shadow-[0_0_20px_rgba(157,78,221,0.5)]',
  },
  green: {
    border: 'border-cyber-green',
    shadow: 'shadow-cyber-green/50',
    glow: 'hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]',
  },
}

export default function NeonBorder({
  children,
  className,
  color = 'cyan',
  animate = true,
}: NeonBorderProps) {
  const colors = colorMap[color]

  return (
    <motion.div
      className={cn(
        'relative border rounded-lg transition-all duration-300',
        colors.border,
        colors.glow,
        animate && 'animate-glow',
        className
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Corner decorations */}
      <div className={cn('absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2', colors.border)} />
      <div className={cn('absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2', colors.border)} />
      <div className={cn('absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2', colors.border)} />
      <div className={cn('absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2', colors.border)} />

      {children}
    </motion.div>
  )
}
