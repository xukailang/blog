'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Highlighter,
  X,
  Trash2,
  Edit2,
  Check,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
} from 'lucide-react'

// 高亮颜色选项
const HIGHLIGHT_COLORS = [
  { name: '黄色', value: '#ffff00' },
  { name: '绿色', value: '#90EE90' },
  { name: '蓝色', value: '#87CEEB' },
  { name: '粉色', value: '#FFB6C1' },
  { name: '橙色', value: '#FFA500' },
]

interface Highlight {
  id: string
  text: string
  note: string | null
  color: string
  startOffset: number
  endOffset: number
  selector: string | null
  createdAt: string
}

interface HighlightManagerProps {
  postSlug: string
  isLoggedIn: boolean
}

export default function HighlightManager({ postSlug, isLoggedIn }: HighlightManagerProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [selectedText, setSelectedText] = useState<{
    text: string
    range: Range | null
    rect: DOMRect | null
  } | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value)
  const [hasBookmark, setHasBookmark] = useState(false)

  // 获取高亮列表
  const fetchHighlights = useCallback(async () => {
    if (!isLoggedIn) return

    try {
      const res = await fetch(`/api/highlights?postSlug=${postSlug}`)
      if (res.ok) {
        const data = await res.json()
        setHighlights(data.highlights || [])
      }
    } catch (error) {
      console.error('Failed to fetch highlights:', error)
    }
  }, [postSlug, isLoggedIn])

  // 检查书签状态
  const checkBookmark = useCallback(async () => {
    if (!isLoggedIn) return

    try {
      const res = await fetch(`/api/bookmarks?postSlug=${postSlug}`)
      if (res.ok) {
        const data = await res.json()
        setHasBookmark(data.hasBookmark)
      }
    } catch (error) {
      console.error('Failed to check bookmark:', error)
    }
  }, [postSlug, isLoggedIn])

  useEffect(() => {
    fetchHighlights()
    checkBookmark()
  }, [fetchHighlights, checkBookmark])

  // 应用高亮到页面
  useEffect(() => {
    // 这里可以实现将高亮应用到实际文本的逻辑
    // 由于涉及 DOM 操作，需要谨慎处理
  }, [highlights])

  // 监听文本选择
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || !isLoggedIn) {
        setSelectedText(null)
        setShowPopup(false)
        return
      }

      const text = selection.toString().trim()
      if (text.length < 3) {
        setSelectedText(null)
        setShowPopup(false)
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      setSelectedText({ text, range, rect })
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      })
      setShowPopup(true)
    }

    document.addEventListener('mouseup', handleSelection)
    return () => document.removeEventListener('mouseup', handleSelection)
  }, [isLoggedIn])

  // 创建高亮
  const createHighlight = async () => {
    if (!selectedText || !selectedText.range) return

    try {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postSlug,
          text: selectedText.text,
          note: noteInput || null,
          color: selectedColor,
          startOffset: selectedText.range.startOffset,
          endOffset: selectedText.range.endOffset,
        }),
      })

      if (res.ok) {
        fetchHighlights()
        setShowPopup(false)
        setSelectedText(null)
        setNoteInput('')
        window.getSelection()?.removeAllRanges()
      }
    } catch (error) {
      console.error('Failed to create highlight:', error)
    }
  }

  // 更新高亮
  const updateHighlight = async (id: string, note: string, color: string) => {
    try {
      const res = await fetch('/api/highlights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, note, color }),
      })

      if (res.ok) {
        fetchHighlights()
        setEditingHighlight(null)
      }
    } catch (error) {
      console.error('Failed to update highlight:', error)
    }
  }

  // 删除高亮
  const deleteHighlight = async (id: string) => {
    try {
      const res = await fetch(`/api/highlights?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchHighlights()
      }
    } catch (error) {
      console.error('Failed to delete highlight:', error)
    }
  }

  // 切换书签
  const toggleBookmark = async () => {
    try {
      if (hasBookmark) {
        const res = await fetch(`/api/bookmarks?postSlug=${postSlug}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setHasBookmark(false)
        }
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postSlug,
            position: window.scrollY / document.body.scrollHeight,
          }),
        })
        if (res.ok) {
          setHasBookmark(true)
        }
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  if (!isLoggedIn) return null

  return (
    <>
      {/* 工具栏 */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2">
        {/* 书签按钮 */}
        <button
          onClick={toggleBookmark}
          className="p-3 rounded-full shadow-lg transition-transform hover:scale-110"
          style={{
            backgroundColor: hasBookmark ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
          title={hasBookmark ? '移除书签' : '添加书签'}
        >
          {hasBookmark ? (
            <BookmarkCheck className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
          ) : (
            <Bookmark className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>

        {/* 高亮数量 */}
        {highlights.length > 0 && (
          <div
            className="px-3 py-2 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            <Highlighter className="w-4 h-4 inline mr-1" />
            {highlights.length}
          </div>
        )}
      </div>

      {/* 选择文本后的弹出菜单 */}
      <AnimatePresence>
        {showPopup && selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-50 p-3 rounded-lg shadow-xl"
            style={{
              left: popupPosition.x,
              top: popupPosition.y,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* 颜色选择 */}
            <div className="flex gap-2 mb-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    border: selectedColor === color.value ? '2px solid var(--text-primary)' : 'none',
                  }}
                  title={color.name}
                />
              ))}
            </div>

            {/* 笔记输入 */}
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="添加笔记（可选）"
              className="w-full px-2 py-1 text-sm rounded mb-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            />

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={createHighlight}
                className="flex-1 px-3 py-1 rounded text-sm font-medium transition-colors"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  color: 'var(--bg-primary)',
                }}
              >
                <Highlighter className="w-4 h-4 inline mr-1" />
                高亮
              </button>
              <button
                onClick={() => {
                  setShowPopup(false)
                  setSelectedText(null)
                  window.getSelection()?.removeAllRanges()
                }}
                className="px-2 py-1 rounded transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 高亮列表侧边栏（可选显示） */}
      {highlights.length > 0 && (
        <div
          className="fixed right-4 top-1/2 -translate-y-1/2 w-64 max-h-96 overflow-y-auto rounded-lg shadow-lg p-3 hidden lg:block"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h4
            className="text-sm font-medium mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Highlighter className="w-4 h-4" />
            我的高亮 ({highlights.length})
          </h4>

          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="p-2 rounded text-xs"
                style={{
                  backgroundColor: highlight.color + '40',
                  borderLeft: `3px solid ${highlight.color}`,
                }}
              >
                <p
                  className="line-clamp-2 mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  "{highlight.text}"
                </p>
                {highlight.note && (
                  <p
                    className="text-xs flex items-center gap-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <MessageSquare className="w-3 h-3" />
                    {highlight.note}
                  </p>
                )}
                <div className="flex justify-end gap-1 mt-1">
                  <button
                    onClick={() => setEditingHighlight(highlight)}
                    className="p-1 rounded hover:bg-black/10"
                  >
                    <Edit2 className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button
                    onClick={() => deleteHighlight(highlight.id)}
                    className="p-1 rounded hover:bg-black/10"
                  >
                    <Trash2 className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 编辑高亮模态框 */}
      <AnimatePresence>
        {editingHighlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingHighlight(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-md p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                编辑高亮
              </h3>

              <div
                className="p-3 rounded mb-4"
                style={{ backgroundColor: editingHighlight.color + '40' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  "{editingHighlight.text}"
                </p>
              </div>

              {/* 颜色选择 */}
              <div className="mb-4">
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  颜色
                </label>
                <div className="flex gap-2">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setEditingHighlight({ ...editingHighlight, color: color.value })
                      }
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color.value,
                        border:
                          editingHighlight.color === color.value
                            ? '2px solid var(--text-primary)'
                            : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 笔记 */}
              <div className="mb-4">
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  笔记
                </label>
                <textarea
                  value={editingHighlight.note || ''}
                  onChange={(e) =>
                    setEditingHighlight({ ...editingHighlight, note: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingHighlight(null)}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() =>
                    updateHighlight(
                      editingHighlight.id,
                      editingHighlight.note || '',
                      editingHighlight.color
                    )
                  }
                  className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    color: 'var(--bg-primary)',
                  }}
                >
                  <Check className="w-4 h-4" />
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
