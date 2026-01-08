'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RegisterFormProps {
  redirectTo?: string
}

export default function RegisterForm({ redirectTo = '/' }: RegisterFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '注册失败')
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          昵称
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
          placeholder="你的昵称"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          邮箱 *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          密码 *
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
          placeholder="至少6个字符"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          确认密码 *
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
          placeholder="再次输入密码"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? '注册中...' : '注册'}
      </button>

      <p className="text-center text-sm text-gray-400">
        已有账号？{' '}
        <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
          立即登录
        </Link>
      </p>
    </form>
  )
}
