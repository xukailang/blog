'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Check, X, AlertCircle, Send, FileText } from 'lucide-react'

interface SchedulePublishProps {
  postSlug: string
  onStatusChange?: (status: PublishStatus) => void
}

type PublishStatus = 'published' | 'scheduled' | 'draft'

interface StatusInfo {
  status: PublishStatus
  scheduledAt: string | null
}

export default function SchedulePublish({ postSlug, onStatusChange }: SchedulePublishProps) {
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 获取当前状态
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/admin/schedule?slug=${postSlug}`)
      if (res.ok) {
        const data = await res.json()
        setStatusInfo(data)
        onStatusChange?.(data.status)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [postSlug])

  // 执行操作
  const handleAction = async (action: string, scheduledAt?: string) => {
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: postSlug,
          action,
          scheduledAt,
        }),
      })

      if (res.ok) {
        fetchStatus()
        setShowScheduler(false)
        setScheduledDate('')
        setScheduledTime('')
      } else {
        const data = await res.json()
        setError(data.error || '操作失败')
      }
    } catch (error) {
      setError('网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  // 设置定时发布
  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      setError('请选择日期和时间')
      return
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
    handleAction('schedule', scheduledAt)
  }

  // 格式化日期显示
  const formatScheduledDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 获取最小日期时间（当前时间）
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // 至少5分钟后
    return now.toISOString().slice(0, 16)
  }

  if (loading) {
    return (
      <div className="animate-pulse h-10 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
    )
  }

  return (
    <div className="space-y-4">
      {/* 当前状态显示 */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusInfo?.status === 'published' && (
              <>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#22c55e' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>已发布</span>
              </>
            )}
            {statusInfo?.status === 'scheduled' && (
              <>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#f59e0b' }}
                />
                <div>
                  <span style={{ color: 'var(--text-primary)' }}>定时发布</span>
                  {statusInfo.scheduledAt && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatScheduledDate(statusInfo.scheduledAt)}
                    </p>
                  )}
                </div>
              </>
            )}
            {statusInfo?.status === 'draft' && (
              <>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#6b7280' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>草稿</span>
              </>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {statusInfo?.status === 'published' && (
              <button
                onClick={() => handleAction('unpublish')}
                disabled={submitting}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                取消发布
              </button>
            )}

            {statusInfo?.status === 'scheduled' && (
              <button
                onClick={() => handleAction('cancel')}
                disabled={submitting}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                取消定时
              </button>
            )}

            {statusInfo?.status !== 'published' && (
              <>
                <button
                  onClick={() => setShowScheduler(!showScheduler)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--accent-primary)',
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  定时发布
                </button>

                <button
                  onClick={() => handleAction('publish')}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    color: 'var(--bg-primary)',
                  }}
                >
                  <Send className="w-4 h-4" />
                  立即发布
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 定时发布选择器 */}
      <AnimatePresence>
        {showScheduler && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4
                className="text-sm font-medium mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Clock className="w-4 h-4" />
                选择发布时间
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    日期
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    时间
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 text-sm mb-3 p-2 rounded"
                  style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowScheduler(false)
                    setError('')
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={submitting || !scheduledDate || !scheduledTime}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    color: 'var(--bg-primary)',
                  }}
                >
                  <Check className="w-4 h-4" />
                  确认
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
