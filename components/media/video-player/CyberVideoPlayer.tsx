'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { VideoProvider, useVideo } from './VideoContext'
import { ControlBar } from './controls/ControlBar'
import { LoadingOverlay } from './overlays/LoadingOverlay'
import { PlayOverlay } from './overlays/PlayOverlay'
import { ToastNotification } from './overlays/ToastNotification'
import { MiniPlayer } from './mini-player/MiniPlayer'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { CONTROLS_HIDE_DELAY } from './constants'
import type { VideoPlayerProps } from './types'
import { cn } from '@/lib/utils'

interface VideoPlayerInnerProps extends VideoPlayerProps {
  onToast: (message: string) => void
}

function VideoPlayerInner({
  src,
  poster,
  title,
  autoPlay = false,
  loop = false,
  muted = false,
  className,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: VideoPlayerInnerProps) {
  const { state, actions, videoRef, containerRef } = useVideo()
  const [showControls, setShowControls] = useState(true)
  const [showMiniPlayer, setShowMiniPlayer] = useState(false)
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastTapTime = useRef<number>(0)

  // Enable keyboard shortcuts
  useKeyboardShortcuts(true)

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    if (state.isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, CONTROLS_HIDE_DELAY)
    }
  }, [state.isPlaying])

  const handleMouseMove = useCallback(() => {
    resetHideTimer()
  }, [resetHideTimer])

  const handleMouseLeave = useCallback(() => {
    if (state.isPlaying) {
      setShowControls(false)
    }
  }, [state.isPlaying])

  // Double-click for fullscreen
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Ignore if clicking on controls
    if ((e.target as HTMLElement).closest('.control-bar')) return
    actions.toggleFullscreen()
  }, [actions])

  // Double-tap for mobile seek
  const handleClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now()
    const timeDiff = now - lastTapTime.current

    if (timeDiff < 300) {
      // Double tap
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const clickX = e.clientX - rect.left
      const isLeftSide = clickX < rect.width / 2

      if (isLeftSide) {
        actions.seekRelative(-10)
      } else {
        actions.seekRelative(10)
      }
    }

    lastTapTime.current = now
  }, [actions, containerRef])

  // Scroll detection for mini player
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isOutOfView = rect.bottom < 0 || rect.top > window.innerHeight

      if (isOutOfView && state.isPlaying && !state.isFullscreen) {
        setShowMiniPlayer(true)
      } else {
        setShowMiniPlayer(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [state.isPlaying, state.isFullscreen, containerRef])

  // Callbacks
  useEffect(() => {
    if (state.isPlaying) {
      onPlay?.()
    } else if (state.isPaused) {
      onPause?.()
    }
  }, [state.isPlaying, state.isPaused, onPlay, onPause])

  useEffect(() => {
    if (state.isEnded) {
      onEnded?.()
    }
  }, [state.isEnded, onEnded])

  useEffect(() => {
    onTimeUpdate?.(state.currentTime)
  }, [state.currentTime, onTimeUpdate])

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'relative bg-cyber-black rounded-lg overflow-hidden group',
          'border border-cyber-cyan/30',
          state.isFullscreen && 'fixed inset-0 z-50 rounded-none border-none',
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          className="w-full aspect-video"
          onClick={(e) => {
            e.stopPropagation()
            actions.togglePlay()
          }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {state.isLoading && <LoadingOverlay />}
        </AnimatePresence>

        <AnimatePresence>
          {!state.isPlaying && !state.isLoading && <PlayOverlay />}
        </AnimatePresence>

        {/* Control Bar */}
        <AnimatePresence>
          {showControls && (
            <div className="control-bar">
              <ControlBar />
            </div>
          )}
        </AnimatePresence>

        {/* Neon Border Effect on Hover */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: 'inset 0 0 30px rgba(0, 245, 255, 0.1)',
          }}
        />
      </div>

      {/* Mini Player */}
      <AnimatePresence>
        {showMiniPlayer && (
          <MiniPlayer
            title={title}
            onClose={() => setShowMiniPlayer(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function CyberVideoPlayer(props: VideoPlayerProps) {
  const [toast, setToast] = useState<string | null>(null)
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current)
    }
    toastTimeout.current = setTimeout(() => {
      setToast(null)
    }, 1500)
  }, [])

  return (
    <VideoProvider onToast={handleToast}>
      <div className="relative">
        <VideoPlayerInner {...props} onToast={handleToast} />
        <ToastNotification message={toast} />
      </div>
    </VideoProvider>
  )
}
