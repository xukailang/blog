'use client'

import { motion } from 'framer-motion'
import { Check, Loader2, AlertCircle } from 'lucide-react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveIndicatorProps {
  status: SaveStatus
  lastSavedAt?: Date | null
}

export default function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === 'saving' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>保存中...</span>
        </motion.div>
      )}

      {status === 'saved' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1"
          style={{ color: 'var(--success-color, #22c55e)' }}
        >
          <Check className="w-3 h-3" />
          <span>
            已保存
            {lastSavedAt && ` · ${formatTime(lastSavedAt)}`}
          </span>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1"
          style={{ color: 'var(--error-color, #ef4444)' }}
        >
          <AlertCircle className="w-3 h-3" />
          <span>保存失败</span>
        </motion.div>
      )}

      {status === 'idle' && lastSavedAt && (
        <div
          className="flex items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>上次保存: {formatTime(lastSavedAt)}</span>
        </div>
      )}
    </div>
  )
}
