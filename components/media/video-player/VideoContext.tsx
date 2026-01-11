'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { VideoState, VideoActions, VideoContextType, ToastMessage } from './types'
import { STORAGE_KEYS, PLAYBACK_RATES } from './constants'

const initialState: VideoState = {
  isPlaying: false,
  isPaused: true,
  isEnded: false,
  isLoading: true,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  buffered: null,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  isFullscreen: false,
  isPiP: false,
  isLoop: false,
  showControls: true,
}

const VideoContext = createContext<VideoContextType | null>(null)

export function useVideo() {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}

interface VideoProviderProps {
  children: ReactNode
  onToast?: (message: string) => void
}

export function VideoProvider({ children, onToast }: VideoProviderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<VideoState>(initialState)

  // Load saved preferences
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME)
    const savedMuted = localStorage.getItem(STORAGE_KEYS.MUTED)
    const savedRate = localStorage.getItem(STORAGE_KEYS.PLAYBACK_RATE)

    setState(prev => ({
      ...prev,
      volume: savedVolume ? parseFloat(savedVolume) : 1,
      isMuted: savedMuted === 'true',
      playbackRate: savedRate ? parseFloat(savedRate) : 1,
    }))
  }, [])

  // Sync video element with state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = state.isMuted ? 0 : state.volume
    video.playbackRate = state.playbackRate
    video.loop = state.isLoop
  }, [state.volume, state.isMuted, state.playbackRate, state.isLoop])

  const showToast = useCallback((message: string) => {
    onToast?.(message)
  }, [onToast])

  const play = useCallback(() => {
    videoRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0))
  }, [])

  const seekRelative = useCallback((delta: number) => {
    const video = videoRef.current
    if (!video) return
    const newTime = video.currentTime + delta
    video.currentTime = Math.max(0, Math.min(newTime, video.duration || 0))
    showToast(`${delta > 0 ? '+' : ''}${delta}s`)
  }, [showToast])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }))
    localStorage.setItem(STORAGE_KEYS.VOLUME, clampedVolume.toString())
    if (clampedVolume > 0) {
      localStorage.setItem(STORAGE_KEYS.MUTED, 'false')
    }
    showToast(`音量 ${Math.round(clampedVolume * 100)}%`)
  }, [showToast])

  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted
      localStorage.setItem(STORAGE_KEYS.MUTED, newMuted.toString())
      showToast(newMuted ? '静音' : `音量 ${Math.round(prev.volume * 100)}%`)
      return { ...prev, isMuted: newMuted }
    })
  }, [showToast])

  const setPlaybackRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }))
    localStorage.setItem(STORAGE_KEYS.PLAYBACK_RATE, rate.toString())
    showToast(`${rate}x 倍速`)
  }, [showToast])

  const toggleLoop = useCallback(() => {
    setState(prev => {
      const newLoop = !prev.isLoop
      showToast(newLoop ? '循环播放' : '取消循环')
      return { ...prev, isLoop: newLoop }
    })
  }, [showToast])

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
        setState(prev => ({ ...prev, isFullscreen: true }))
      } else {
        await document.exitFullscreen()
        setState(prev => ({ ...prev, isFullscreen: false }))
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setState(prev => ({ ...prev, isPiP: false }))
        showToast('退出画中画')
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
        setState(prev => ({ ...prev, isPiP: true }))
        showToast('画中画模式')
      }
    } catch (err) {
      console.error('PiP error:', err)
    }
  }, [showToast])

  const takeScreenshot = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const link = document.createElement('a')
    link.download = `screenshot-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    showToast('截图已保存')
  }, [showToast])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true, isPaused: false, isEnded: false }))
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false, isPaused: true }))
    const handleEnded = () => setState(prev => ({ ...prev, isPlaying: false, isEnded: true }))
    const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: video.currentTime }))
    const handleDurationChange = () => setState(prev => ({ ...prev, duration: video.duration }))
    const handleProgress = () => setState(prev => ({ ...prev, buffered: video.buffered }))
    const handleWaiting = () => setState(prev => ({ ...prev, isBuffering: true }))
    const handlePlaying = () => setState(prev => ({ ...prev, isBuffering: false, isLoading: false }))
    const handleLoadedMetadata = () => setState(prev => ({ ...prev, isLoading: false, duration: video.duration }))
    const handleVolumeChange = () => setState(prev => ({ ...prev, volume: video.volume, isMuted: video.muted }))

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // PiP change listener
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnterPiP = () => setState(prev => ({ ...prev, isPiP: true }))
    const handleLeavePiP = () => setState(prev => ({ ...prev, isPiP: false }))

    video.addEventListener('enterpictureinpicture', handleEnterPiP)
    video.addEventListener('leavepictureinpicture', handleLeavePiP)

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP)
      video.removeEventListener('leavepictureinpicture', handleLeavePiP)
    }
  }, [])

  const actions: VideoActions = {
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleLoop,
    toggleFullscreen,
    togglePiP,
    takeScreenshot,
    showToast,
  }

  return (
    <VideoContext.Provider value={{ state, actions, videoRef, containerRef }}>
      {children}
    </VideoContext.Provider>
  )
}
