'use client'

import { useState, useEffect } from 'react'
import { diffLines, getDiffStats, DiffPart } from '@/lib/versions/diff-utils'

interface VersionDiffProps {
  oldVersionId: string
  newVersionId: string
  postSlug: string
}

interface VersionContent {
  id: string
  version: number
  title: string
  content: string
  createdAt: string
}

export default function VersionDiff({ oldVersionId, newVersionId, postSlug }: VersionDiffProps) {
  const [oldVersion, setOldVersion] = useState<VersionContent | null>(null)
  const [newVersion, setNewVersion] = useState<VersionContent | null>(null)
  const [diff, setDiff] = useState<DiffPart[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified')

  useEffect(() => {
    fetchVersions()
  }, [oldVersionId, newVersionId])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const [oldRes, newRes] = await Promise.all([
        fetch(`/api/admin/posts/${postSlug}/versions/${oldVersionId}`),
        fetch(`/api/admin/posts/${postSlug}/versions/${newVersionId}`),
      ])

      if (!oldRes.ok || !newRes.ok) throw new Error('获取版本失败')

      const oldData = await oldRes.json()
      const newData = await newRes.json()

      setOldVersion(oldData.version)
      setNewVersion(newData.version)

      // 计算差异
      const diffResult = diffLines(oldData.version.content, newData.version.content)
      setDiff(diffResult)
    } catch (error) {
      console.error('Fetch versions error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        加载中...
      </div>
    )
  }

  if (!oldVersion || !newVersion) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--error-color, #ef4444)' }}>
        无法加载版本内容
      </div>
    )
  }

  const stats = getDiffStats(diff)

  return (
    <div className="h-full flex flex-col">
      {/* 头部信息 */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>版本 </span>
            <span style={{ color: 'var(--text-primary)' }}>{oldVersion.version}</span>
            <span style={{ color: 'var(--text-muted)' }}> → </span>
            <span style={{ color: 'var(--text-primary)' }}>{newVersion.version}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: 'var(--success-color, #22c55e)' }}>+{stats.additions}</span>
            <span style={{ color: 'var(--error-color, #ef4444)' }}>-{stats.deletions}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('unified')}
            className={`px-3 py-1 text-sm rounded ${viewMode === 'unified' ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : ''}`}
            style={viewMode !== 'unified' ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' } : {}}
          >
            统一视图
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 text-sm rounded ${viewMode === 'split' ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : ''}`}
            style={viewMode !== 'split' ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' } : {}}
          >
            分栏视图
          </button>
        </div>
      </div>

      {/* 差异内容 */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'unified' ? (
          <UnifiedDiff diff={diff} />
        ) : (
          <SplitDiff oldContent={oldVersion.content} newContent={newVersion.content} />
        )}
      </div>
    </div>
  )
}

// 统一视图
function UnifiedDiff({ diff }: { diff: DiffPart[] }) {
  let lineNumber = 0

  return (
    <div className="font-mono text-sm">
      {diff.map((part, index) => {
        const lines = part.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || part.value.slice(-1) !== '\n')

        return lines.map((line, lineIndex) => {
          if (!part.removed) lineNumber++

          return (
            <div
              key={`${index}-${lineIndex}`}
              className="flex"
              style={{
                backgroundColor: part.added
                  ? 'rgba(34, 197, 94, 0.1)'
                  : part.removed
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'transparent',
              }}
            >
              <div
                className="w-12 px-2 text-right select-none flex-shrink-0"
                style={{
                  color: 'var(--text-muted)',
                  borderRight: '1px solid var(--border-color)',
                }}
              >
                {!part.removed && lineNumber}
              </div>
              <div
                className="w-6 text-center select-none flex-shrink-0"
                style={{
                  color: part.added
                    ? 'var(--success-color, #22c55e)'
                    : part.removed
                    ? 'var(--error-color, #ef4444)'
                    : 'var(--text-muted)',
                }}
              >
                {part.added ? '+' : part.removed ? '-' : ' '}
              </div>
              <div
                className="flex-1 px-2 whitespace-pre-wrap break-all"
                style={{ color: 'var(--text-primary)' }}
              >
                {line || ' '}
              </div>
            </div>
          )
        })
      })}
    </div>
  )
}

// 分栏视图
function SplitDiff({ oldContent, newContent }: { oldContent: string; newContent: string }) {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const maxLines = Math.max(oldLines.length, newLines.length)

  return (
    <div className="flex font-mono text-sm">
      {/* 旧版本 */}
      <div className="flex-1" style={{ borderRight: '1px solid var(--border-color)' }}>
        <div
          className="px-3 py-2 text-xs font-medium sticky top-0"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          旧版本
        </div>
        {oldLines.map((line, index) => (
          <div key={index} className="flex">
            <div
              className="w-10 px-2 text-right select-none flex-shrink-0"
              style={{ color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)' }}
            >
              {index + 1}
            </div>
            <div
              className="flex-1 px-2 whitespace-pre-wrap break-all"
              style={{ color: 'var(--text-primary)' }}
            >
              {line || ' '}
            </div>
          </div>
        ))}
      </div>

      {/* 新版本 */}
      <div className="flex-1">
        <div
          className="px-3 py-2 text-xs font-medium sticky top-0"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          新版本
        </div>
        {newLines.map((line, index) => (
          <div key={index} className="flex">
            <div
              className="w-10 px-2 text-right select-none flex-shrink-0"
              style={{ color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)' }}
            >
              {index + 1}
            </div>
            <div
              className="flex-1 px-2 whitespace-pre-wrap break-all"
              style={{ color: 'var(--text-primary)' }}
            >
              {line || ' '}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
