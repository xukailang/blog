'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Moon, Sun, Zap } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import UserMenu from '@/components/auth/UserMenu'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light' | 'cyber'>('cyber')
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const themes: ('dark' | 'light' | 'cyber')[] = ['cyber', 'dark', 'light']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-cyber-black/90 backdrop-blur-md border-b border-cyber-cyan/30'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-cyber-cyan to-cyber-pink rounded-lg flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-cyber-black" />
            </motion.div>
            <span className="font-cyber text-xl font-bold text-cyber-cyan group-hover:text-cyber-pink transition-colors glitch" data-text={siteConfig.name}>
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
                  pathname === item.href
                    ? 'text-cyber-cyan neon-text'
                    : 'text-gray-400 hover:text-cyber-cyan'
                )}
              >
                {item.name}
                <span className={cn(
                  'absolute -bottom-1 left-0 h-0.5 bg-cyber-cyan transition-all duration-300',
                  pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                )} />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-400 hover:text-cyber-cyan transition-colors"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-cyber-pink transition-colors"
            >
              {theme === 'light' ? (
                <Sun className="w-5 h-5" />
              ) : theme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </motion.button>

            {/* User Menu */}
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-cyber-cyan transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSearch}
              className="pb-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文章..."
                  className="w-full bg-cyber-dark border border-cyber-cyan/30 rounded-lg px-4 py-2 pl-10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan font-mono"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-cyber-dark/95 backdrop-blur-md border-b border-cyber-cyan/30"
          >
            <div className="px-4 py-4 space-y-2">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-lg font-cyber text-sm uppercase tracking-wider transition-all',
                    pathname === item.href
                      ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30'
                      : 'text-gray-400 hover:bg-cyber-cyan/5 hover:text-cyber-cyan'
                  )}
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
