'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  slug: string
}

export default function LikeButton({ slug }: LikeButtonProps) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check localStorage for liked status
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}')
    if (likedPosts[slug]) {
      setLiked(true)
    }

    // Fetch likes count from API
    fetch(`/api/likes?slug=${slug}`)
      .then(res => res.json())
      .then(data => setLikes(data.likes || 0))
      .catch(() => setLikes(0))
  }, [slug])

  const handleLike = async () => {
    if (liked) return

    setIsAnimating(true)
    setLiked(true)
    setLikes(prev => prev + 1)

    // Save to localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}')
    likedPosts[slug] = true
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts))

    // Send to API
    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
    } catch (error) {
      console.error('Failed to save like:', error)
    }

    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLike}
      disabled={liked}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
        liked
          ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink'
          : 'bg-cyber-dark border-cyber-cyan/30 text-gray-400 hover:text-cyber-pink hover:border-cyber-pink'
      )}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn('w-5 h-5', liked && 'fill-cyber-pink')}
        />
      </motion.div>
      <span className="text-sm font-mono">{likes}</span>
    </motion.button>
  )
}
