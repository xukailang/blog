'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, FileText, Tag, Folder } from 'lucide-react'

interface SearchResult {
  slug: string
  title: string
  description: string
  category: string
  date: string
  highlights: {
    title?: string
    content?: string
  }
  score: number
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const searchPosts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPosts(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchPosts])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      router.push(`/blog/${results[selectedIndex].slug}`)
      onClose()
    }
  }

  const handleResultClick = (slug: string) => {
    router.push(`/blog/${slug}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl mx-4 rounded-xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid var(--border-color)' }}
          >
            <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索文章..."
              className="flex-1 bg-transparent outline-none text-lg"
              style={{ color: 'var(--text-primary)' }}
            />
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 && query && !loading && (
              <div className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                没有找到相关文章
              </div>
            )}

            {results.map((result, index) => (
              <div
                key={result.slug}
                onClick={() => handleResultClick(result.slug)}
                className="px-4 py-3 cursor-pointer transition-colors"
                style={{
                  backgroundColor: index === selectedIndex ? 'var(--bg-tertiary)' : 'transparent',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-3">
                  <FileText
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium mb-1"
                      style={{ color: 'var(--text-primary)' }}
                      dangerouslySetInnerHTML={{
                        __html: result.highlights.title || result.title,
                      }}
                    />
                    {result.highlights.content && (
                      <p
                        className="text-sm line-clamp-2 mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                        dangerouslySetInnerHTML={{ __html: result.highlights.content }}
                      />
                    )}
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {result.category}
                      </span>
                      <span>{result.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2 flex items-center justify-between text-xs"
            style={{
              borderTop: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)]">↑↓</kbd> 导航
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)]">Enter</kbd> 打开
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)]">Esc</kbd> 关闭
              </span>
            </div>
            {results.length > 0 && (
              <span>找到 {results.length} 篇文章</span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
