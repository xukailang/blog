'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import WechatBindCard from '@/components/auth/WechatBindCard'

interface User {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
  role: 'USER' | 'ADMIN'
}

interface WechatBindInfo {
  nickname: string | null
  avatar: string | null
  bindAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [message, setMessage] = useState('')
  const [wechatBind, setWechatBind] = useState<WechatBindInfo | null>(null)
  const [hasPassword, setHasPassword] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchWechatStatus()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()

      if (!data.user) {
        router.push('/auth/login')
        return
      }

      setUser(data.user)
      setName(data.user.name || '')
      setAvatar(data.user.avatar || '')
    } catch {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchWechatStatus = async () => {
    try {
      const res = await fetch('/api/auth/wechat/status')
      const data = await res.json()
      if (res.ok) {
        setWechatBind(data.wechatBind)
        setHasPassword(data.hasPassword)
      }
    } catch {
      // 忽略错误
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar }),
      })

      if (res.ok) {
        setMessage('保存成功')
        fetchUser()
      } else {
        const data = await res.json()
        setMessage(data.error || '保存失败')
      }
    } catch {
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setAvatar(data.url)
        setMessage('头像上传成功')
        fetchUser()
      } else {
        setMessage(data.error || '上传失败')
      }
    } catch {
      setMessage('上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              ← 返回
            </Link>
            <h1 className="text-lg font-medium text-white">个人资料</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message === '保存成功'
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                    {(name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                  title="上传头像"
                >
                  {uploading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  头像
                </label>
                <p className="text-sm text-gray-500">
                  点击相机图标上传头像，支持 JPG、PNG、GIF、WebP，最大 2MB
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={user.email || '未设置'}
                disabled
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                昵称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                placeholder="你的昵称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                角色
              </label>
              <div className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400">
                {user.role === 'ADMIN' ? '管理员' : '普通用户'}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>

        {/* 微信绑定管理 */}
        <div className="mt-6">
          <WechatBindCard wechatBind={wechatBind} hasPassword={hasPassword} />
        </div>
      </main>
    </div>
  )
}
