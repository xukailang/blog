import { useState, useEffect, useCallback, useRef } from 'react'
import type { SaveStatus } from '@/components/admin/editor/AutoSaveIndicator'

interface UseAutoSaveOptions {
  postSlug?: string | null
  debounceMs?: number
  enabled?: boolean
}

interface AutoSaveData {
  title?: string
  content: string
  metadata?: Record<string, unknown>
}

export function useAutoSave(
  data: AutoSaveData,
  options: UseAutoSaveOptions = {}
) {
  const { postSlug = null, debounceMs = 3000, enabled = true } = options

  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [lastSavedData, setLastSavedData] = useState<string>('')

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 序列化数据用于比较
  const serializedData = JSON.stringify(data)

  // 保存函数
  const save = useCallback(async () => {
    if (!enabled) return

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setStatus('saving')

    try {
      const response = await fetch('/api/admin/drafts/auto-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postSlug,
          ...data,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Save failed')
      }

      setStatus('saved')
      setLastSavedAt(new Date())
      setLastSavedData(serializedData)

      // 3秒后恢复 idle 状态
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return // 请求被取消，不处理
      }
      setStatus('error')
      console.error('Auto save error:', error)

      // 5秒后恢复 idle 状态
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
    }
  }, [enabled, postSlug, data, serializedData])

  // 防抖保存
  useEffect(() => {
    if (!enabled) return
    if (serializedData === lastSavedData) return
    if (!data.content) return // 内容为空时不保存

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      save()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [serializedData, lastSavedData, debounceMs, enabled, save, data.content])

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // 手动保存
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    save()
  }, [save])

  // 加载自动保存的草稿
  const loadDraft = useCallback(async (): Promise<AutoSaveData | null> => {
    try {
      const url = postSlug
        ? `/api/admin/drafts/auto-save?slug=${encodeURIComponent(postSlug)}`
        : '/api/admin/drafts/auto-save'

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Load failed')
      }

      const draft = await response.json()
      return {
        title: draft.title,
        content: draft.content,
        metadata: draft.metadata,
      }
    } catch (error) {
      console.error('Load draft error:', error)
      return null
    }
  }, [postSlug])

  // 删除自动保存的草稿
  const deleteDraft = useCallback(async () => {
    try {
      const url = postSlug
        ? `/api/admin/drafts/auto-save?slug=${encodeURIComponent(postSlug)}`
        : '/api/admin/drafts/auto-save'

      await fetch(url, { method: 'DELETE' })
      setLastSavedData('')
      setLastSavedAt(null)
    } catch (error) {
      console.error('Delete draft error:', error)
    }
  }, [postSlug])

  return {
    status,
    lastSavedAt,
    saveNow,
    loadDraft,
    deleteDraft,
  }
}
