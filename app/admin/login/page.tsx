'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LoginMode = 'password' | 'email'

export default function AdminLoginPage() {
  const [mode, setMode] = useState<LoginMode>('password')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登录失败')
        return
      }

      router.push('/admin')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First login as user
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: userPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登录失败')
        return
      }

      // Check if user is admin
      if (data.user.role !== 'ADMIN') {
        setError('您没有管理员权限')
        // Logout
        await fetch('/api/auth/logout', { method: 'POST' })
        return
      }

      router.push('/admin')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-cyan-500/30">
        <h1 className="text-2xl font-bold text-center mb-6 text-cyan-400">
          后台管理登录
        </h1>

        {/* Login Mode Toggle */}
        <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === 'password'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            管理员密码
          </button>
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === 'email'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            账号登录
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                管理员密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-400"
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="userPassword" className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                type="password"
                id="userPassword"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? '登录中...' : '登录'}
            </button>

            <p className="text-center text-sm text-gray-400">
              需要管理员账号才能登录后台
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-gray-500 text-sm">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            返回首页
          </Link>
        </p>
      </div>
    </div>
  )
}
