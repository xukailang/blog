'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoEmbedProps {
  src: string
  title?: string
  poster?: string
  className?: string
  type?: 'youtube' | 'bilibili' | 'local'
}

export default function VideoEmbed({ src, title, poster, className, type = 'local' }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const getEmbedUrl = () => {
    if (type === 'youtube') {
      const videoId = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`
    }
    if (type === 'bilibili') {
      const bvid = src.match(/BV\w+/)?.[0]
      return `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=1`
    }
    return src
  }

  if (type === 'local') {
    return (
      <div className={cn('relative rounded-lg overflow-hidden border border-cyber-cyan/30', className)}>
        <video
          src={src}
          poster={poster}
          controls
          className="w-full"
          title={title}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden border border-cyber-cyan/30', className)}>
      {!isPlaying ? (
        <div
          className="relative aspect-video bg-cyber-dark cursor-pointer group"
          onClick={() => setIsPlaying(true)}
        >
          {poster && (
            <img
              src={poster}
              alt={title || 'Video thumbnail'}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-cyber-black/50 flex items-center justify-center group-hover:bg-cyber-black/30 transition-colors">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-full flex items-center justify-center"
            >
              <Play className="w-10 h-10 text-cyber-black ml-1" />
            </motion.div>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cyber-black to-transparent">
              <p className="text-white font-mono">{title}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative aspect-video">
          <iframe
            src={getEmbedUrl()}
            title={title || 'Video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
