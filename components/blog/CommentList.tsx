'use client'

import { useState, useEffect } from 'react'
import CommentForm from './CommentForm'
import { MessageCircle } from 'lucide-react'

interface Comment {
  id: string
  content: string
  guestName: string | null
  createdAt: string
  parentId: string | null
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
  const [replyToUser, setReplyToUser] = useState<string | null>(null)

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

  const getDisplayName = (comment: Comment) => {
    return comment.user?.name || comment.guestName || '匿名'
  }

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId)
    setReplyToUser(userName)
  }

  const countAllComments = (comments: Comment[]): number => {
    let count = 0
    const countRecursive = (items: Comment[]) => {
      items.forEach(item => {
        count++
        if (item.replies?.length > 0) {
          countRecursive(item.replies)
        }
      })
    }
    countRecursive(comments)
    return count
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const maxIndent = 4
    const actualDepth = Math.min(depth, maxIndent)
    const marginLeft = actualDepth * 24

    return (
      <div key={comment.id} style={{ marginLeft: depth > 0 ? `${marginLeft}px` : 0 }}>
        <div className={`${depth > 0 ? 'mt-4 pt-4 border-t border-gray-700/50' : ''}`}>
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {comment.user?.avatar ? (
              <img
                src={comment.user.avatar}
                alt=""
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-sm flex-shrink-0">
                {getDisplayName(comment)[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-white text-sm font-medium">
                  {getDisplayName(comment)}
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
              <p className="text-gray-300 text-sm mb-2 break-words">{comment.content}</p>

              {/* Actions */}
              <button
                onClick={() => handleReply(comment.id, getDisplayName(comment))}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                回复
              </button>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-2">
                    回复 <span className="text-cyan-400">@{replyToUser}</span>
                  </div>
                  <CommentForm
                    postSlug={postSlug}
                    parentId={comment.id}
                    onSuccess={() => {
                      setReplyingTo(null)
                      setReplyToUser(null)
                      fetchComments()
                    }}
                    onCancel={() => {
                      setReplyingTo(null)
                      setReplyToUser(null)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies - 递归渲染 */}
        {comment.replies?.length > 0 && (
          <div className="relative">
            {depth < maxIndent && (
              <div
                className="absolute left-4 top-0 bottom-0 w-px bg-gray-700/50"
                style={{ marginLeft: '0px' }}
              />
            )}
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        加载评论中...
      </div>
    )
  }

  const totalComments = countAllComments(comments)

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
          评论 ({totalComments})
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
