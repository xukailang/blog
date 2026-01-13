'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, defaultLocale, getCurrentLocale, setLocaleCookie } from '@/lib/i18n/config'

// 翻译消息类型
type Messages = Record<string, Record<string, string>>

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  messages: Messages
}

const I18nContext = createContext<I18nContextType | null>(null)

// 加载翻译文件
async function loadMessages(locale: Locale): Promise<Messages> {
  try {
    const messages = await import(`@/messages/${locale}.json`)
    return messages.default
  } catch {
    console.warn(`Failed to load messages for locale: ${locale}`)
    const fallback = await import(`@/messages/${defaultLocale}.json`)
    return fallback.default
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [messages, setMessages] = useState<Messages>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // 初始化
  useEffect(() => {
    const initLocale = getCurrentLocale()
    setLocaleState(initLocale)
    loadMessages(initLocale).then(msgs => {
      setMessages(msgs)
      setIsLoaded(true)
    })
  }, [])

  // 切换语言
  const setLocale = async (newLocale: Locale) => {
    setLocaleCookie(newLocale)
    setLocaleState(newLocale)
    const msgs = await loadMessages(newLocale)
    setMessages(msgs)
  }

  // 翻译函数
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: unknown = messages

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key // 返回原始 key 作为 fallback
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, name) => {
        return params[name]?.toString() ?? `{${name}}`
      })
    }

    return value
  }

  // 等待加载完成
  if (!isLoaded) {
    return null // 或者返回加载指示器
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, messages }}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// 简化的翻译 Hook
export function useTranslation() {
  const { t, locale } = useI18n()
  return { t, locale }
}
