'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { EMOJI_CATEGORIES, FREQUENT_EMOJIS, searchEmojis } from '@/lib/editor/emoji-data'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  // 自动聚焦搜索框
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji)
  }

  const filteredEmojis = searchQuery
    ? searchEmojis(searchQuery)
    : null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute z-50 w-80 rounded-lg shadow-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* 搜索栏 */}
      <div
        className="p-2"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索表情..."
            className="w-full pl-8 pr-8 py-1.5 text-sm rounded"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* 分类标签 */}
      {!searchQuery && (
        <div
          className="flex gap-1 p-2 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          {EMOJI_CATEGORIES.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(index)}
              className={`p-1.5 rounded text-lg transition-colors ${
                activeCategory === index ? 'bg-[var(--accent-primary)]/20' : 'hover:bg-[var(--bg-tertiary)]'
              }`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji 网格 */}
      <div className="p-2 max-h-64 overflow-y-auto">
        {filteredEmojis ? (
          // 搜索结果
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="p-1.5 text-xl rounded hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          // 分类显示
          <>
            {/* 常用 */}
            <div className="mb-3">
              <div
                className="text-xs font-medium mb-1 px-1"
                style={{ color: 'var(--text-muted)' }}
              >
                常用
              </div>
              <div className="grid grid-cols-8 gap-1">
                {FREQUENT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-1.5 text-xl rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 当前分类 */}
            <div>
              <div
                className="text-xs font-medium mb-1 px-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {EMOJI_CATEGORIES[activeCategory].name}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-1.5 text-xl rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
