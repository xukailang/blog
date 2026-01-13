'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, MessageCircle, Heart, AtSign, Info, Moon } from 'lucide-react'

interface NotificationPreference {
  emailEnabled: boolean
  pushEnabled: boolean
  commentReply: boolean
  postLike: boolean
  mention: boolean
  system: boolean
  emailDigest: 'instant' | 'daily' | 'weekly' | 'none'
  quietHoursStart: number | null
  quietHoursEnd: number | null
}

export default function NotificationPreferences() {
  const [preference, setPreference] = useState<NotificationPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreference()
  }, [])

  const fetchPreference = async () => {
    try {
      const res = await fetch('/api/notifications/preferences')
      if (res.ok) {
        const data = await res.json()
        setPreference(data.preference)
      }
    } catch (error) {
      console.error('Fetch preference error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (updates: Partial<NotificationPreference>) => {
    if (!preference) return

    setSaving(true)
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...preference, ...updates }),
      })

      if (res.ok) {
        const data = await res.json()
        setPreference(data.preference)
      }
    } catch (error) {
      console.error('Update preference error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
        加载中...
      </div>
    )
  }

  if (!preference) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
        无法加载通知设置
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 通知渠道 */}
      <section>
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          通知渠道
        </h3>
        <div className="space-y-3">
          <ToggleItem
            icon={Bell}
            label="浏览器推送"
            description="接收浏览器推送通知"
            checked={preference.pushEnabled}
            onChange={(checked) => updatePreference({ pushEnabled: checked })}
            disabled={saving}
          />
          <ToggleItem
            icon={Mail}
            label="邮件通知"
            description="接收邮件通知"
            checked={preference.emailEnabled}
            onChange={(checked) => updatePreference({ emailEnabled: checked })}
            disabled={saving}
          />
        </div>
      </section>

      {/* 通知类型 */}
      <section>
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          通知类型
        </h3>
        <div className="space-y-3">
          <ToggleItem
            icon={MessageCircle}
            label="评论回复"
            description="有人回复你的评论时通知"
            checked={preference.commentReply}
            onChange={(checked) => updatePreference({ commentReply: checked })}
            disabled={saving}
          />
          <ToggleItem
            icon={Heart}
            label="文章点赞"
            description="有人点赞你的文章时通知"
            checked={preference.postLike}
            onChange={(checked) => updatePreference({ postLike: checked })}
            disabled={saving}
          />
          <ToggleItem
            icon={AtSign}
            label="@提及"
            description="有人在评论中提及你时通知"
            checked={preference.mention}
            onChange={(checked) => updatePreference({ mention: checked })}
            disabled={saving}
          />
          <ToggleItem
            icon={Info}
            label="系统通知"
            description="接收系统公告和更新"
            checked={preference.system}
            onChange={(checked) => updatePreference({ system: checked })}
            disabled={saving}
          />
        </div>
      </section>

      {/* 邮件摘要 */}
      {preference.emailEnabled && (
        <section>
          <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            邮件摘要频率
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['instant', 'daily', 'weekly', 'none'] as const).map((option) => (
              <button
                key={option}
                onClick={() => updatePreference({ emailDigest: option })}
                disabled={saving}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  preference.emailDigest === option
                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                    : ''
                }`}
                style={
                  preference.emailDigest !== option
                    ? {
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                      }
                    : {}
                }
              >
                {option === 'instant' && '即时'}
                {option === 'daily' && '每日摘要'}
                {option === 'weekly' && '每周摘要'}
                {option === 'none' && '不发送'}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 静默时间 */}
      <section>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Moon className="w-5 h-5" />
          静默时间
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          在此时间段内不发送通知
        </p>
        <div className="flex items-center gap-3">
          <select
            value={preference.quietHoursStart ?? ''}
            onChange={(e) =>
              updatePreference({
                quietHoursStart: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            disabled={saving}
            className="px-3 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <option value="">不设置</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}:00
              </option>
            ))}
          </select>
          <span style={{ color: 'var(--text-muted)' }}>至</span>
          <select
            value={preference.quietHoursEnd ?? ''}
            onChange={(e) =>
              updatePreference({
                quietHoursEnd: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            disabled={saving || preference.quietHoursStart === null}
            className="px-3 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <option value="">不设置</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  )
}

// 开关项组件
function ToggleItem({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        <div>
          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {description}
          </div>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          backgroundColor: checked ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
        }}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full"
          style={{ backgroundColor: 'white' }}
          animate={{ left: checked ? '1.5rem' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
