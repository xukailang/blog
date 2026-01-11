'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface WechatLoginModalProps {
  isOpen: boolean
  onClose: () => void
  scene?: 'login' | 'bind'
  onSuccess?: () => void
}

type Status = 'loading' | 'ready' | 'pending' | 'scanned' | 'confirmed' | 'needBind' | 'expired' | 'error'

interface WechatInfo {
  nickname: string
  avatar: string
  openId: string
}

export default function WechatLoginModal({
  isOpen,
  onClose,
  scene = 'login',
  onSuccess,
}: WechatLoginModalProps) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [qrcodeUrl, setQrcodeUrl] = useState('')
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const [wechatInfo, setWechatInfo] = useState<WechatInfo | null>(null)
  const [bindEmail, setBindEmail] = useState('')
  const [bindPassword, setBindPassword] = useState('')
  const [bindLoading, setBindLoading] = useState(false)

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/auth/wechat/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '生成二维码失败')
      }

      setQrcodeUrl(data.qrcodeUrl)
      setState(data.state)
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成二维码失败')
      setStatus('error')
    }
  }, [scene])

  // 轮询状态
  useEffect(() => {
    if (!isOpen || !state || status === 'needBind' || status === 'error') return

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/wechat/poll?state=${state}`)
        const data = await res.json()

        if (data.status === 'confirmed') {
          if (data.needBind) {
            setWechatInfo(data.wechatInfo)
            setStatus('needBind')
          } else {
            setStatus('confirmed')
            setTimeout(() => {
              onSuccess?.()
              onClose()
              router.refresh()
            }, 1000)
          }
        } else if (data.status === 'expired') {
          setStatus('expired')
        } else if (data.status === 'scanned') {
          setStatus('scanned')
        } else if (data.status === 'error') {
          setError(data.message || '登录失败')
          setStatus('error')
        }
      } catch {
        // 忽略轮询错误
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [isOpen, state, status, onClose, onSuccess, router])

  // 打开时生成二维码
  useEffect(() => {
    if (isOpen) {
      generateQRCode()
    } else {
      // 关闭时重置状态
      setStatus('loading')
      setQrcodeUrl('')
      setState('')
      setError('')
      setWechatInfo(null)
      setBindEmail('')
      setBindPassword('')
    }
  }, [isOpen, generateQRCode])

  // 绑定已有账号
  const handleBindExisting = async (e: React.FormEvent) => {
    e.preventDefault()
    setBindLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/wechat/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state,
          email: bindEmail,
          password: bindPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '绑定失败')
      }

      setStatus('confirmed')
      setTimeout(() => {
        onSuccess?.()
        onClose()
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '绑定失败')
    } finally {
      setBindLoading(false)
    }
  }

  // 创建新账号
  const handleCreateNew = async () => {
    setBindLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/wechat/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state,
          createNew: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '创建失败')
      }

      setStatus('confirmed')
      setTimeout(() => {
        onSuccess?.()
        onClose()
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setBindLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-gray-900 border border-cyber-purple/30 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 标题 */}
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          {scene === 'bind' ? '绑定微信' : '微信登录'}
        </h2>

        {/* 内容区域 */}
        <div className="flex flex-col items-center">
          {/* 加载状态 */}
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
              <p className="text-gray-400 mt-4">正在加载...</p>
            </div>
          )}

          {/* 二维码显示 */}
          {(status === 'ready' || status === 'pending') && qrcodeUrl && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <iframe
                  src={qrcodeUrl}
                  width="300"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  className="rounded"
                />
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                请使用微信扫描二维码{scene === 'bind' ? '绑定' : '登录'}
              </p>
            </div>
          )}

          {/* 已扫码状态 */}
          {status === 'scanned' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 text-cyber-green animate-spin" />
              <p className="text-cyber-green mt-4">已扫码，请在手机上确认</p>
            </div>
          )}

          {/* 登录成功 */}
          {status === 'confirmed' && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="w-12 h-12 text-cyber-green" />
              <p className="text-cyber-green mt-4 text-lg">
                {scene === 'bind' ? '绑定成功' : '登录成功'}
              </p>
            </div>
          )}

          {/* 需要绑定账号 */}
          {status === 'needBind' && wechatInfo && (
            <div className="w-full">
              {/* 微信用户信息 */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-800 rounded-lg">
                {wechatInfo.avatar && (
                  <img
                    src={wechatInfo.avatar}
                    alt={wechatInfo.nickname}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-white font-medium">{wechatInfo.nickname}</p>
                  <p className="text-gray-400 text-sm">微信用户</p>
                </div>
              </div>

              {/* 绑定选项 */}
              <div className="space-y-4">
                {/* 绑定已有账号 */}
                <form onSubmit={handleBindExisting} className="space-y-3">
                  <p className="text-gray-300 text-sm">绑定已有账号：</p>
                  <input
                    type="email"
                    placeholder="邮箱"
                    value={bindEmail}
                    onChange={(e) => setBindEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan"
                    required
                  />
                  <input
                    type="password"
                    placeholder="密码"
                    value={bindPassword}
                    onChange={(e) => setBindPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan"
                    required
                  />
                  <button
                    type="submit"
                    disabled={bindLoading}
                    className="w-full py-2 bg-cyber-cyan text-black font-medium rounded-lg hover:bg-cyber-cyan/80 transition-colors disabled:opacity-50"
                  >
                    {bindLoading ? '绑定中...' : '绑定账号'}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-500">或</span>
                  </div>
                </div>

                {/* 创建新账号 */}
                <button
                  onClick={handleCreateNew}
                  disabled={bindLoading}
                  className="w-full py-2 bg-gray-800 text-white font-medium rounded-lg border border-gray-700 hover:border-cyber-purple transition-colors disabled:opacity-50"
                >
                  {bindLoading ? '创建中...' : '创建新账号'}
                </button>
              </div>
            </div>
          )}

          {/* 二维码过期 */}
          {status === 'expired' && (
            <div className="flex flex-col items-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500" />
              <p className="text-yellow-500 mt-4">二维码已过期</p>
              <button
                onClick={generateQRCode}
                className="mt-4 px-6 py-2 bg-cyber-cyan text-black font-medium rounded-lg hover:bg-cyber-cyan/80 transition-colors"
              >
                刷新二维码
              </button>
            </div>
          )}

          {/* 错误状态 */}
          {status === 'error' && (
            <div className="flex flex-col items-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-500 mt-4">{error || '发生错误'}</p>
              <button
                onClick={generateQRCode}
                className="mt-4 px-6 py-2 bg-cyber-cyan text-black font-medium rounded-lg hover:bg-cyber-cyan/80 transition-colors"
              >
                重试
              </button>
            </div>
          )}

          {/* 错误提示 */}
          {error && status === 'needBind' && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
