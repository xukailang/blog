'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Eye, RotateCcw, ChevronRight, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Version {
  id: string
  version: number
  title: string
  changeNote: string | null
  createdBy: string | null
  createdAt: string
}

interface VersionHistoryProps {
  postSlug: string
  onPreview?: (versionId: string) => void
  onRestore?: (versionId: string) => void
}

export default function VersionHistory({ postSlug, onPreview, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetchVersions()
  }, [postSlug])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/posts/${postSlug}/versions`)
      if (!res.ok) throw new Error('获取版本列表失败')
      const data = await res.json()
      setVersions(data.versions)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    if (!confirm('确定要恢复到此版本吗？当前内容将被覆盖。')) return

    setRestoring(true)
    try {
      const res = await fetch(`/api/admin/posts/${postSlug}/versions/${versionId}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('恢复失败')

      onRestore?.(versionId)
      alert('恢复成功！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '恢复失败')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
        加载中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--error-color, #ef4444)' }}>
        {error}
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>暂无版本历史</p>
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
      {versions.map((version, index) => (
        <motion.div
          key={version.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`p-4 cursor-pointer transition-colors ${
            selectedVersion === version.id ? 'bg-[var(--accent-primary)]/10' : 'hover:bg-[var(--bg-tertiary)]'
          }`}
          onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  backgroundColor: index === 0 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: index === 0 ? 'var(--bg-primary)' : 'var(--text-secondary)',
                }}
              >
                {version.version}
              </div>
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {version.title}
                  {index === 0 && (
                    <span
                      className="ml-2 px-2 py-0.5 text-xs rounded"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--bg-primary)',
                      }}
                    >
                      当前
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(version.createdAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                  {version.changeNote && (
                    <span className="truncate max-w-[200px]">{version.changeNote}</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 transition-transform ${
                selectedVersion === version.id ? 'rotate-90' : ''
              }`}
              style={{ color: 'var(--text-muted)' }}
            />
          </div>

          <AnimatePresence>
            {selectedVersion === version.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview?.(version.id)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    预览
                  </button>
                  {index !== 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore(version.id)
                      }}
                      disabled={restoring}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--bg-primary)',
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {restoring ? '恢复中...' : '恢复此版本'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}
