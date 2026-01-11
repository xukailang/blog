'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

interface ScrollToTopProps {
  threshold?: number
  className?: string
}

export default function ScrollToTop({ threshold = 400, className = '' }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-cyber-dark border border-cyber-cyan/50 text-cyber-cyan shadow-lg shadow-cyber-cyan/20 hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:shadow-cyber-cyan/40 transition-all duration-300 group ${className}`}
          aria-label="返回顶部"
          title="返回顶部"
        >
          <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />

          {/* Glow effect */}
          <span className="absolute inset-0 rounded-full bg-cyber-cyan/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
