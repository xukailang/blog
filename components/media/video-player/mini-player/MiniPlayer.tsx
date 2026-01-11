'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, GripHorizontal } from 'lucide-react'
import { useVideo } from '../VideoContext'

interface MiniPlayerProps {
  title?: string
  onClose: () => void
}

export function MiniPlayer({ title, onClose }: MiniPlayerProps) {
  const { state, actions, videoRef } = useVideo()
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 })

  // Initialize position to bottom-right
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 340,
        y: window.innerHeight - 220,
      })
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    }
  }, [position])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y

      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 320, dragStartRef.current.posX + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - 200, dragStartRef.current.posY + deltaY)),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const progress = state.duration > 0
    ? (state.currentTime / state.duration) * 100
    : 0

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed z-50 w-80 bg-cyber-dark border border-cyber-cyan/30 rounded-lg overflow-hidden shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        boxShadow: '0 0 30px rgba(0, 245, 255, 0.2)',
      }}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-cyber-black/50 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-gray-400">
          <GripHorizontal className="w-4 h-4" />
          <span className="text-xs font-mono truncate max-w-[200px]">
            {title || '视频播放'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Video Preview */}
      <div className="relative aspect-video bg-black">
        {videoRef.current && (
          <video
            ref={(el) => {
              // Clone the video source for mini player preview
              if (el && videoRef.current) {
                el.src = videoRef.current.src
                el.currentTime = videoRef.current.currentTime
                el.muted = true
              }
            }}
            className="w-full h-full object-contain"
            muted
          />
        )}

        {/* Play/Pause Overlay */}
        <button
          onClick={actions.togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
        >
          {state.isPlaying ? (
            <Pause className="w-10 h-10 text-white" fill="white" />
          ) : (
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-3 py-2 bg-cyber-black/50">
        <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00f5ff, #ff006e)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs font-mono text-gray-400">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>
    </motion.div>
  )
}
