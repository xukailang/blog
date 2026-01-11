'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '200px' } = options
  const observerRef = useRef<IntersectionObserver | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(callback)

  // 保持 callback 引用最新
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const setTarget = useCallback((node: HTMLDivElement | null) => {
    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            callbackRef.current()
          }
        },
        { threshold, rootMargin }
      )
      observerRef.current.observe(node)
    }

    targetRef.current = node
  }, [threshold, rootMargin])

  // 清理
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { setTarget }
}
