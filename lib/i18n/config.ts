// i18n 配置
export const locales = ['zh-CN', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh-CN'

export const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  'en': 'English',
}

// 获取浏览器语言
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language

  // 精确匹配
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale
  }

  // 前缀匹配
  const prefix = browserLang.split('-')[0]
  const matched = locales.find(l => l.startsWith(prefix))

  return matched || defaultLocale
}

// 从 cookie 获取语言
export function getLocaleFromCookie(): Locale | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/)
  const locale = match ? decodeURIComponent(match[1]) : null

  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale
  }

  return null
}

// 设置语言到 cookie
export function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return

  const maxAge = 365 * 24 * 60 * 60 // 1 年
  document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

// 获取当前语言
export function getCurrentLocale(): Locale {
  const cookieLocale = getLocaleFromCookie()
  if (cookieLocale) return cookieLocale

  return getBrowserLocale()
}
