'use client'

import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useVideo } from '../VideoContext'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ProgressBar() {
  const { state, actions } = useVideo()
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState(0)

  const progress = state.duration > 0
    ? (state.currentTime / state.duration) * 100
    : 0

  const getBufferedProgress = useCallback(() => {
    if (!state.buffered || state.buffered.length === 0 || state.duration === 0) return 0
    const bufferedEnd = state.buffered.end(state.buffered.length - 1)
    return (bufferedEnd / state.duration) * 100
  }, [state.buffered, state.duration])

  const handleClick = (e: React.MouseEvent) => {
    if (!progressRef.current || state.duration === 0) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    actions.seek(percent * state.duration)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!progressRef.current || state.duration === 0) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverTime(percent * state.duration)
    setHoverPosition(e.clientX - rect.left)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleClick(e)

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!progressRef.current || state.duration === 0) return
      const rect = progressRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      actions.seek(percent * state.duration)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMoveGlobal)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMoveGlobal)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="relative px-4 py-2 group/progress">
      {/* Hover Time Preview */}
      {hoverTime !== null && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 px-2 py-1 bg-cyber-dark/95 border border-cyber-cyan/30 rounded text-xs font-mono text-cyber-cyan pointer-events-none"
          style={{ left: hoverPosition, transform: 'translateX(-50%)' }}
        >
          {formatTime(hoverTime)}
        </motion.div>
      )}

      {/* Progress Track */}
      <div
        ref={progressRef}
        className="relative h-1 bg-white/20 rounded-full cursor-pointer group-hover/progress:h-1.5 transition-all"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
        onMouseDown={handleMouseDown}
      >
        {/* Buffered Progress */}
        <div
          className="absolute inset-y-0 left-0 bg-cyber-cyan/30 rounded-full"
          style={{ width: `${getBufferedProgress()}%` }}
        />

        {/* Played Progress */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00f5ff, #ff006e)',
          }}
          animate={{
            boxShadow: isDragging
              ? '0 0 15px rgba(0, 245, 255, 0.8)'
              : '0 0 5px rgba(0, 245, 255, 0.5)',
          }}
        />

        {/* Thumb */}
        <motion.div
          className="absolute top-1/2 w-3 h-3 rounded-full bg-cyber-cyan border-2 border-white opacity-0 group-hover/progress:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          style={{
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)',
          }}
          whileHover={{ scale: 1.3 }}
        />
      </div>
    </div>
  )
}
