'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'reading-mode'

export function useReadingMode() {
  const [isReadingMode, setIsReadingMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setIsReadingMode(true)
    }
  }, [])

  const toggleReadingMode = useCallback(() => {
    setIsReadingMode(prev => {
      const newValue = !prev
      localStorage.setItem(STORAGE_KEY, String(newValue))
      return newValue
    })
  }, [])

  const enableReadingMode = useCallback(() => {
    setIsReadingMode(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const disableReadingMode = useCallback(() => {
    setIsReadingMode(false)
    localStorage.setItem(STORAGE_KEY, 'false')
  }, [])

  return {
    isReadingMode: mounted ? isReadingMode : false,
    toggleReadingMode,
    enableReadingMode,
    disableReadingMode,
    mounted
  }
}
