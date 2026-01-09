'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ChevronDown
} from 'lucide-react'
import { useBGM } from './BGMProvider'
import { cn } from '@/lib/utils'

export default function BGMPlayer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    isPlaying,
    isMuted,
    volume,
    currentTrack,
    progress,
    duration,
    togglePlay,
    toggleMute,
    setVolume,
    nextTrack,
    prevTrack,
    seekTo,
  } = useBGM()

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div
        className={cn(
          'backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300',
          isExpanded ? 'w-72' : 'w-14'
        )}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        {!isExpanded && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 flex items-center justify-center transition-colors relative"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Music className="w-6 h-6" />
            {isPlaying && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--cyber-green)' }}
              />
            )}
          </motion.button>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-cyber uppercase tracking-wider"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  BGM Player
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsExpanded(false)}
                  className="p-1 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              </div>

              {currentTrack && (
                <div className="mb-3">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {currentTrack.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {currentTrack.artist}
                  </p>
                </div>
              )}

              <div className="mb-3">
                <div
                  className="h-1 rounded-full cursor-pointer overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const percent = (e.clientX - rect.left) / rect.width
                    seekTo(percent * duration)
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))'
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTrack}
                  className="p-2 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <SkipBack className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="p-3 rounded-full"
                  style={{ background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', color: 'var(--bg-primary)' }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTrack}
                  className="p-2 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <SkipForward className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="p-1 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </motion.button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, var(--accent-primary) ${(isMuted ? 0 : volume) * 100}%, var(--bg-secondary) ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
