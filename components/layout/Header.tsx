'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Moon, Sun, Zap, Rss } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import UserMenu from '@/components/auth/UserMenu'
import SearchModal from '@/components/search/SearchModal'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleTheme = () => {
    const themes = ['cyber', 'dark', 'light']
    const currentIndex = themes.indexOf(theme || 'cyber')
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const getThemeIcon = () => {
    if (!mounted) return <Zap className="w-5 h-5" />

    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'dark':
        return <Moon className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'backdrop-blur-md border-b'
          : 'bg-transparent'
      )}
      style={{
        backgroundColor: isScrolled ? 'var(--header-bg)' : 'transparent',
        borderColor: 'var(--border-color)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(to bottom right, var(--accent-primary), var(--accent-secondary))' }}
            >
              <Zap className="w-6 h-6" style={{ color: 'var(--bg-primary)' }} />
            </motion.div>
            <span
              className="font-cyber text-xl font-bold transition-colors glitch"
              data-text={siteConfig.name}
              style={{ color: 'var(--accent-primary)' }}
            >
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'font-cyber text-sm uppercase tracking-wider transition-all duration-300 relative group',
                  pathname === item.href ? 'neon-text' : ''
                )}
                style={{
                  color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}
              >
                {item.name}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-0.5 transition-all duration-300',
                    pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* RSS Button */}
            <motion.a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 transition-colors hidden sm:block"
              style={{ color: 'var(--text-secondary)' }}
              title="RSS 订阅"
            >
              <Rss className="w-5 h-5" />
            </motion.a>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="p-2 transition-colors flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
              title="搜索 (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline text-xs px-1.5 py-0.5 rounded bg-[var(--bg-secondary)]">
                Ctrl+K
              </span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 transition-colors"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {getThemeIcon()}
            </motion.button>

            {/* Notification Bell */}
            <div className="hidden md:block">
              <NotificationBell />
            </div>

            {/* User Menu */}
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden backdrop-blur-md border-b"
            style={{
              backgroundColor: 'var(--header-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="px-4 py-4 space-y-2">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg font-cyber text-sm uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: pathname === item.href ? 'var(--bg-secondary)' : 'transparent',
                    color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: pathname === item.href ? '1px solid var(--border-color)' : '1px solid transparent',
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
