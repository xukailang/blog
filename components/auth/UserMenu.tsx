'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: 'USER' | 'ADMIN'
}

export default function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setIsOpen(false)
    router.refresh()
  }

  if (loading) {
    return <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
        >
          登录
        </Link>
        <Link
          href="/auth/register"
          className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
        >
          注册
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
        )}
        <span className="text-sm text-gray-300 hidden sm:block">
          {user.name || user.email.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-gray-700">
            <p className="text-sm font-medium text-white truncate">
              {user.name || user.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              个人资料
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-cyan-400 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                管理后台
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
