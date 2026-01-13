'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, FileCode, X, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  postSlug: string
  postTitle: string
}

export default function ExportButton({ postSlug, postTitle }: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (format: 'markdown' | 'pdf' | 'text') => {
    setExporting(format)

    try {
      let url: string
      let filename: string

      switch (format) {
        case 'markdown':
          url = `/api/export/markdown?slug=${encodeURIComponent(postSlug)}`
          filename = `${postSlug}.md`
          break
        case 'pdf':
          url = `/api/export/pdf?slug=${encodeURIComponent(postSlug)}`
          filename = `${postSlug}.html`
          break
        case 'text':
          url = `/api/export/markdown?slug=${encodeURIComponent(postSlug)}&format=text`
          filename = `${postSlug}.txt`
          break
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('导出失败')
      }

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      setShowModal(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('导出失败，请重试')
    } finally {
      setExporting(null)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        <Download className="w-4 h-4" />
        导出
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowModal(false)}
            />

            {/* 模态框 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-xl z-50"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  导出文章
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded hover:bg-[var(--bg-tertiary)]"
                >
                  <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                选择导出格式：{postTitle}
              </p>

              <div className="space-y-3">
                <ExportOption
                  icon={FileCode}
                  title="Markdown"
                  description="导出为 .md 文件，保留完整格式"
                  onClick={() => handleExport('markdown')}
                  loading={exporting === 'markdown'}
                  disabled={!!exporting}
                />
                <ExportOption
                  icon={FileText}
                  title="HTML (可打印为 PDF)"
                  description="导出为 HTML 文件，可在浏览器中打印为 PDF"
                  onClick={() => handleExport('pdf')}
                  loading={exporting === 'pdf'}
                  disabled={!!exporting}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function ExportOption({
  icon: Icon,
  title,
  description,
  onClick,
  loading,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  title: string
  description: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-start gap-3 p-4 rounded-lg text-left transition-colors hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
      style={{ border: '1px solid var(--border-color)' }}
    >
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent-primary)' }} />
        ) : (
          <Icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        )}
      </div>
      <div>
        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {description}
        </div>
      </div>
    </button>
  )
}
