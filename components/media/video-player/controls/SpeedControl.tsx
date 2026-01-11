'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gauge } from 'lucide-react'
import { useVideo } from '../VideoContext'
import { PLAYBACK_RATES } from '../constants'

export function SpeedControl() {
  const { state, actions } = useVideo()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm font-mono text-white hover:text-cyber-cyan transition-colors"
        title="倍速 (</>)"
      >
        <span>{state.playbackRate}x</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-1 bg-cyber-dark/95 border border-cyber-cyan/30 rounded-lg overflow-hidden backdrop-blur-sm"
          >
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  actions.setPlaybackRate(rate)
                  setIsOpen(false)
                }}
                className={`block w-full px-4 py-1.5 text-sm font-mono text-left transition-colors ${
                  state.playbackRate === rate
                    ? 'text-cyber-cyan bg-cyber-cyan/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {rate}x
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
