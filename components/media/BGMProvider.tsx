'use client'

import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { BGMTrack, bgmConfig, getTracksForPath } from '@/config/bgm'

interface BGMContextType {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  currentTrack: BGMTrack | null
  tracks: BGMTrack[]
  progress: number
  duration: number
  play: () => void
  pause: () => void
  togglePlay: () => void
  toggleMute: () => void
  setVolume: (volume: number) => void
  nextTrack: () => void
  prevTrack: () => void
  seekTo: (time: number) => void
}

const BGMContext = createContext<BGMContextType | null>(null)

export function useBGM() {
  const context = useContext(BGMContext)
  if (!context) {
    throw new Error('useBGM must be used within a BGMProvider')
  }
  return context
}

interface BGMProviderProps {
  children: ReactNode
}

export default function BGMProvider({ children }: BGMProviderProps) {
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(bgmConfig.settings.defaultMuted)
  const [volume, setVolumeState] = useState(bgmConfig.settings.defaultVolume)
  const [tracks, setTracks] = useState<BGMTrack[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const currentTrack = tracks[currentTrackIndex] || null

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.loop = false
      audioRef.current.volume = isMuted ? 0 : volume

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime)
        }
      })

      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration)
        }
      })

      audioRef.current.addEventListener('ended', () => {
        setCurrentTrackIndex(prev => (prev + 1) % (tracks.length || 1))
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const newTracks = getTracksForPath(pathname)
    const currentTrackIds = tracks.map(t => t.id).join(',')
    const newTrackIds = newTracks.map(t => t.id).join(',')

    if (currentTrackIds !== newTrackIds) {
      setTracks(newTracks)
      setCurrentTrackIndex(0)
    }
  }, [pathname, tracks])

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const wasPlaying = isPlaying
      audioRef.current.src = currentTrack.src
      audioRef.current.load()

      if (wasPlaying && hasUserInteracted) {
        audioRef.current.play().catch(() => {})
      }
    }
  }, [currentTrack?.id])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const play = useCallback(() => {
    if (audioRef.current) {
      setHasUserInteracted(true)
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)))
  }, [])

  const nextTrack = useCallback(() => {
    if (tracks.length > 0) {
      setCurrentTrackIndex(prev => (prev + 1) % tracks.length)
    }
  }, [tracks.length])

  const prevTrack = useCallback(() => {
    if (tracks.length > 0) {
      setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length)
    }
  }, [tracks.length])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }, [])

  const value: BGMContextType = {
    isPlaying,
    isMuted,
    volume,
    currentTrack,
    tracks,
    progress,
    duration,
    play,
    pause,
    togglePlay,
    toggleMute,
    setVolume,
    nextTrack,
    prevTrack,
    seekTo,
  }

  return (
    <BGMContext.Provider value={value}>
      {children}
    </BGMContext.Provider>
  )
}
