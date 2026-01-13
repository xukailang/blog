'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, User, Smile } from 'lucide-react'
import { FREQUENT_EMOJIS, searchEmojis } from '@/lib/editor/emoji-data'

export type AutoCompleteType = 'link' | 'mention' | 'emoji'

export interface AutoCompleteSuggestion {
  type: AutoCompleteType
  value: string
  label: string
  description?: string
  icon?: string
}

interface AutoCompleteProps {
  type: AutoCompleteType
  query: string
  position: { top: number; left: number }
  onSelect: (suggestion: AutoCompleteSuggestion) => void
  onClose: () => void
  posts?: Array<{ slug: string; title: string }>
  users?: Array<{ id: string; name: string; avatar?: string }>
}

export default function AutoComplete({
  type,
  query,
  position,
  onSelect,
  onClose,
  posts = [],
  users = [],
}: AutoCompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 生成建议列表
  const suggestions: AutoCompleteSuggestion[] = (() => {
    switch (type) {
      case 'link':
        return posts
          .filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.slug.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8)
          .map(p => ({
            type: 'link' as const,
            value: `/blog/${p.slug}`,
            label: p.title,
            description: p.slug,
          }))

      case 'mention':
        return users
          .filter(u =>
            u.name?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8)
          .map(u => ({
            type: 'mention' as const,
            value: u.name || u.id,
            label: u.name || '未命名用户',
            icon: u.avatar,
          }))

      case 'emoji':
        const emojis = query ? searchEmojis(query) : FREQUENT_EMOJIS
        return emojis.slice(0, 8).map(e => ({
          type: 'emoji' as const,
          value: e,
          label: e,
        }))

      default:
        return []
    }
  })()

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [suggestions, selectedIndex, onSelect, onClose])

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (suggestions.length === 0) {
    return null
  }

  const getIcon = (suggestion: AutoCompleteSuggestion) => {
    switch (suggestion.type) {
      case 'link':
        return <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      case 'mention':
        if (suggestion.icon) {
          return (
            <img
              src={suggestion.icon}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          )
        }
        return <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      case 'emoji':
        return <span className="text-lg">{suggestion.value}</span>
      default:
        return null
    }
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="absolute z-50 w-64 rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="py-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.value}-${index}`}
            onClick={() => onSelect(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
              index === selectedIndex ? 'bg-[var(--accent-primary)]/10' : ''
            }`}
          >
            <div className="flex-shrink-0">
              {getIcon(suggestion)}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {suggestion.label}
              </div>
              {suggestion.description && (
                <div
                  className="text-xs truncate"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {suggestion.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* 提示 */}
      <div
        className="px-3 py-1.5 text-xs flex items-center gap-2"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <span>↑↓ 选择</span>
        <span>↵ 确认</span>
        <span>Esc 关闭</span>
      </div>
    </motion.div>
  )
}
