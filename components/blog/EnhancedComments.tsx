'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  ThumbsUp,
  Heart,
  Smile,
  Frown,
  AlertCircle,
  MoreHorizontal,
  Flag,
  Edit2,
  Trash2,
  Reply,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  ArrowUpDown,
} from 'lucide-react'

// 表情配置
const EMOJI_CONFIG = {
  like: { emoji: '👍', label: '赞', icon: ThumbsUp },
  love: { emoji: '❤️', label: '喜欢', icon: Heart },
  laugh: { emoji: '😄', label: '哈哈', icon: Smile },
  wow: { emoji: '😮', label: '惊讶', icon: AlertCircle },
  sad: { emoji: '😢', label: '难过', icon: Frown },
  angry: { emoji: '😠', label: '生气', icon: AlertCircle },
}

type EmojiType = keyof typeof EMOJI_CONFIG

interface User {
  id: string
  name: string | null
  avatar: string | null
}

interface Comment {
  id: string
  content: string
  postSlug: string
  userId: string | null
  guestName: string | null
  guestEmail: string | null
  parentId: string | null
  isApproved: boolean
  isEdited: boolean
  editedAt: string | null
  createdAt: string
  user: User | null
  reactionCounts: Record<string, number>
  totalReactions: number
  replies: Comment[]
  _count: { replies: number }
}

interface CommentsProps {
  postSlug: string
  currentUserId?: string
}

type SortType = 'newest' | 'oldest' | 'popular'

const SORT_OPTIONS: { value: SortType; label: string; icon: typeof Clock }[] = [
  { value: 'newest', label: '最新', icon: Clock },
  { value: 'oldest', label: '最早', icon: Clock },
  { value: 'popular', label: '最热', icon: TrendingUp },
]

export default function EnhancedComments({ postSlug, currentUserId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortType>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)

  // 新评论表单状态
  const [newComment, setNewComment] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postSlug}/comments?sort=${sort}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }, [postSlug, sort])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          parentId: replyTo,
          guestName: currentUserId ? undefined : guestName,
          guestEmail: currentUserId ? undefined : guestEmail,
        }),
      })

      if (res.ok) {
        setNewComment('')
        setReplyTo(null)
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReaction = async (commentId: string, emoji: EmojiType) => {
    try {
      const res = await fetch('/api/comments/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, emoji }),
      })

      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    }
  }

  const handleReport = async (commentId: string, reason: string, detail?: string) => {
    try {
      const res = await fetch('/api/comments/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reason, detail }),
      })

      if (res.ok) {
        alert('举报已提交，我们会尽快处理')
      } else {
        const data = await res.json()
        alert(data.error || '举报失败')
      }
    } catch (error) {
      console.error('Failed to report comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return

    try {
      const res = await fetch(`/api/posts/${postSlug}/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <div className="mt-16 pt-8 border-t border-cyber-cyan/20">
      {/* 标题和排序 */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-cyber text-xl text-cyber-cyan flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          评论 ({comments.length})
        </h3>

        {/* 排序选择器 */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowUpDown className="w-4 h-4" />
            {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            {showSortMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 py-1 rounded-lg shadow-lg z-10"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSort(option.value)
                      setShowSortMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors"
                    style={{
                      color: sort === option.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8">
        {replyTo && (
          <div
            className="mb-2 px-3 py-2 rounded-lg flex items-center justify-between"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              回复评论
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-sm hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              取消
            </button>
          </div>
        )}

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
        />

        {/* 游客信息（未登录时显示） */}
        {!currentUserId && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="昵称"
              className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            />
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="邮箱（可选）"
              className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            />
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'var(--bg-primary)',
            }}
          >
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </div>
      </form>

      {/* 评论列表 */}
      {loading ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          加载中...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          暂无评论，来发表第一条评论吧！
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={(id) => setReplyTo(id)}
              onReaction={handleReaction}
              onReport={handleReport}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 单个评论组件
interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onReply: (id: string) => void
  onReaction: (commentId: string, emoji: EmojiType) => void
  onReport: (commentId: string, reason: string, detail?: string) => void
  onDelete: (commentId: string) => void
  depth?: number
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onReaction,
  onReport,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const authorName = comment.user?.name || comment.guestName || '匿名用户'
  const authorAvatar = comment.user?.avatar
  const isOwner = currentUserId && comment.userId === currentUserId

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
      style={{ marginLeft: depth > 0 ? '2rem' : 0 }}
    >
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: depth > 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* 头部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* 头像 */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: authorAvatar ? 'transparent' : 'var(--accent-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full object-cover" />
              ) : (
                authorName.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {authorName}
                </span>
                {comment.isEdited && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    (已编辑)
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* 更多菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 py-1 rounded-lg shadow-lg z-10 min-w-[120px]"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          // TODO: 实现编辑功能
                        }}
                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--bg-tertiary)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          onDelete(comment.id)
                        }}
                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--bg-tertiary)]"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setShowReportModal(true)
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--bg-tertiary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Flag className="w-4 h-4" />
                    举报
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 内容 */}
        <p className="mb-4 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
          {comment.content}
        </p>

        {/* 底部操作栏 */}
        <div className="flex items-center gap-4">
          {/* 表情反应 */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <Smile className="w-4 h-4" />
              {comment.totalReactions > 0 && <span>{comment.totalReactions}</span>}
            </button>

            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 p-2 rounded-lg shadow-lg flex gap-1"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {(Object.keys(EMOJI_CONFIG) as EmojiType[]).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction(comment.id, emoji)
                        setShowReactions(false)
                      }}
                      className="p-2 rounded hover:bg-[var(--bg-tertiary)] transition-colors text-lg"
                      title={EMOJI_CONFIG[emoji].label}
                    >
                      {EMOJI_CONFIG[emoji].emoji}
                      {comment.reactionCounts[emoji] > 0 && (
                        <span className="text-xs ml-1">{comment.reactionCounts[emoji]}</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 显示已有的反应 */}
          {Object.entries(comment.reactionCounts).map(([emoji, count]) => (
            count > 0 && (
              <button
                key={emoji}
                onClick={() => onReaction(comment.id, emoji as EmojiType)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {EMOJI_CONFIG[emoji as EmojiType]?.emoji}
                <span>{count}</span>
              </button>
            )
          ))}

          {/* 回复按钮 */}
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--accent-primary)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <Reply className="w-4 h-4" />
            回复
          </button>
        </div>
      </div>

      {/* 回复列表 */}
      {comment.replies.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-sm mb-2"
            style={{ color: 'var(--accent-primary)' }}
          >
            {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {comment.replies.length} 条回复
          </button>

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onReaction={onReaction}
                    onReport={onReport}
                    onDelete={onDelete}
                    depth={depth + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 举报模态框 */}
      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            onClose={() => setShowReportModal(false)}
            onSubmit={(reason, detail) => {
              onReport(comment.id, reason, detail)
              setShowReportModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 举报模态框
interface ReportModalProps {
  onClose: () => void
  onSubmit: (reason: string, detail?: string) => void
}

const REPORT_REASONS = [
  { value: 'SPAM', label: '垃圾信息' },
  { value: 'HARASSMENT', label: '骚扰' },
  { value: 'INAPPROPRIATE', label: '不当内容' },
  { value: 'MISINFORMATION', label: '虚假信息' },
  { value: 'OTHER', label: '其他' },
]

function ReportModal({ onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          举报评论
        </h3>

        <div className="space-y-3 mb-4">
          {REPORT_REASONS.map((r) => (
            <label
              key={r.value}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor: reason === r.value ? 'var(--bg-tertiary)' : 'transparent',
                border: '1px solid var(--border-color)',
              }}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={(e) => setReason(e.target.value)}
                className="accent-[var(--accent-primary)]"
              />
              <span style={{ color: 'var(--text-primary)' }}>{r.label}</span>
            </label>
          ))}
        </div>

        {reason === 'OTHER' && (
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="请描述具体原因..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          />
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            取消
          </button>
          <button
            onClick={() => onSubmit(reason, detail)}
            disabled={!reason}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'var(--bg-primary)',
            }}
          >
            提交举报
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
