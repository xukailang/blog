'use client'

import { useState } from 'react'

interface CommentFormProps {
  postSlug: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CommentForm({ postSlug, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  // Check login status on mount
  useState(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsLoggedIn(!!data.user))
      .catch(() => setIsLoggedIn(false))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('请输入评论内容')
      return
    }

    if (!isLoggedIn && !guestName.trim()) {
      setError('请输入昵称')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          guestName: guestName.trim() || undefined,
          guestEmail: guestEmail.trim() || undefined,
          parentId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '发表失败')
        return
      }

      setContent('')
      setGuestName('')
      setGuestEmail('')
      onSuccess?.()
    } catch {
      setError('发表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Guest info (only show if not logged in) */}
      {isLoggedIn === false && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white text-sm"
              placeholder="昵称 *"
            />
          </div>
          <div>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white text-sm"
              placeholder="邮箱（可选）"
            />
          </div>
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white resize-none"
          placeholder={parentId ? '写下你的回复...' : '写下你的评论...'}
          rows={parentId ? 2 : 4}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isLoggedIn === false && '游客评论需要审核后才会显示'}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '发表中...' : '发表评论'}
          </button>
        </div>
      </div>
    </form>
  )
}
