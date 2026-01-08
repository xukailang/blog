'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Track {
  title: string
  artist: string
  src: string
  cover?: string
}

interface AudioPlayerProps {
  tracks: Track[]
  className?: string
}

export default function AudioPlayer({ tracks, className }: AudioPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      nextTrack()
    }
  }

  const nextTrack = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length)
      setCurrentTrack(randomIndex)
    } else {
      setCurrentTrack((prev) => (prev + 1) % tracks.length)
    }
    setIsPlaying(true)
  }

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length)
    setIsPlaying(true)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const track = tracks[currentTrack]

  if (!track) return null

  return (
    <div className={cn('bg-cyber-dark/80 border border-cyber-cyan/30 rounded-lg p-4 backdrop-blur-sm', className)}>
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyber-cyan to-cyber-pink rounded-lg flex items-center justify-center">
          {track.cover ? (
            <img src={track.cover} alt={track.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Volume2 className="w-8 h-8 text-cyber-black" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-cyber text-white truncate">{track.title}</h4>
          <p className="text-gray-500 text-sm font-mono truncate">{track.artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 bg-cyber-dark rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyber-cyan [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00f5ff ${(progress / duration) * 100}%, #1a1a2e ${(progress / duration) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsShuffle(!isShuffle)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isShuffle ? 'text-cyber-cyan' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <Shuffle className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevTrack}
            className="p-2 text-gray-400 hover:text-cyber-cyan transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="p-3 bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-full text-cyber-black"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextTrack}
            className="p-2 text-gray-400 hover:text-cyber-cyan transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRepeat(!isRepeat)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isRepeat ? 'text-cyber-cyan' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <Repeat className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
