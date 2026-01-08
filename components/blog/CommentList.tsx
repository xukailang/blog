'use client'

import { useState, useEffect } from 'react'
import CommentForm from './CommentForm'

interface Comment {
  id: string
  content: string
  guestName: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    avatar: string | null
  } | null
  replies: Comment[]
}

interface CommentListProps {
  postSlug: string
}

export default function CommentList({ postSlug }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [postSlug])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postSlug}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-8 mt-4' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {comment.user?.avatar ? (
          <img
            src={comment.user.avatar}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-sm">
            {(comment.user?.name || comment.guestName || 'U')[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-sm font-medium">
              {comment.user?.name || comment.guestName || '匿名'}
            </span>
            {comment.user && (
              <span className="px-1.5 py-0.5 text-xs bg-cyan-600/20 text-cyan-400 rounded">
                会员
              </span>
            )}
            <span className="text-gray-500 text-xs">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-gray-300 text-sm mb-2">{comment.content}</p>

          {/* Actions */}
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
            >
              回复
            </button>
          )}

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <CommentForm
                postSlug={postSlug}
                parentId={comment.id}
                onSuccess={() => {
                  setReplyingTo(null)
                  fetchComments()
                }}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies?.map((reply) => renderComment(reply, true))}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        加载评论中...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">发表评论</h3>
        <CommentForm postSlug={postSlug} onSuccess={fetchComments} />
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          评论 ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无评论，来发表第一条评论吧
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  )
}
