'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck } from 'lucide-react'

interface FavoriteButtonProps {
  slug: string
  className?: string
}

export default function FavoriteButton({ slug, className = '' }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkFavorite()
  }, [slug])

  const checkFavorite = async () => {
    try {
      const res = await fetch(`/api/favorites/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setFavorited(data.favorited)
      }
    } catch (error) {
      console.error('Failed to check favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`/api/favorites/${slug}`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setFavorited(data.favorited)
      } else if (res.status === 401) {
        alert('请先登录')
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  if (loading) {
    return (
      <div
        className={`p-2 rounded-lg ${className}`}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <Bookmark className="w-5 h-5 animate-pulse" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleFavorite}
      className={`p-2 rounded-lg transition-colors ${className}`}
      style={{
        backgroundColor: favorited ? 'var(--accent-primary)20' : 'var(--bg-secondary)',
      }}
      title={favorited ? '取消收藏' : '收藏文章'}
    >
      {favorited ? (
        <BookmarkCheck className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
      ) : (
        <Bookmark className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
      )}
    </motion.button>
  )
}
