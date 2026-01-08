'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlitchTextProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export default function GlitchText({ text, className, as: Component = 'span' }: GlitchTextProps) {
  return (
    <motion.div
      className="glitch-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Component
        className={cn('glitch font-cyber', className)}
        data-text={text}
      >
        {text}
      </Component>
    </motion.div>
  )
}
