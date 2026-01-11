'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Volume1, VolumeX } from 'lucide-react'
import { useVideo } from '../VideoContext'

export function VolumeControl() {
  const { state, actions } = useVideo()
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const VolumeIcon = state.isMuted || state.volume === 0
    ? VolumeX
    : state.volume < 0.5
      ? Volume1
      : Volume2

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    actions.setVolume(percent)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleSliderClick(e)

    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      actions.setVolume(percent)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

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
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => !isDragging && setIsOpen(false)}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={actions.toggleMute}
        className="p-2 text-white hover:text-cyber-cyan transition-colors"
        title={state.isMuted ? '取消静音 (M)' : '静音 (M)'}
      >
        <VolumeIcon className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              ref={sliderRef}
              className="relative h-1 mx-2 bg-white/20 rounded-full cursor-pointer"
              onClick={handleSliderClick}
              onMouseDown={handleMouseDown}
            >
              {/* Volume Level */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-cyber-cyan"
                style={{ width: `${state.isMuted ? 0 : state.volume * 100}%` }}
                animate={{
                  boxShadow: isDragging
                    ? '0 0 10px rgba(0, 245, 255, 0.8)'
                    : '0 0 5px rgba(0, 245, 255, 0.5)',
                }}
              />

              {/* Thumb */}
              <motion.div
                className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-cyber-cyan border border-white cursor-grab active:cursor-grabbing"
                style={{
                  left: `${state.isMuted ? 0 : state.volume * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 8px rgba(0, 245, 255, 0.8)',
                }}
                whileHover={{ scale: 1.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
