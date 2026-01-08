'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <motion.div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
    />
  )
}
