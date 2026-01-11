'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Link2, Unlink } from 'lucide-react'
import WechatLoginModal from './WechatLoginModal'

interface WechatBindInfo {
  nickname: string | null
  avatar: string | null
  bindAt: string
}

interface WechatBindCardProps {
  wechatBind: WechatBindInfo | null
  hasPassword: boolean
}

export default function WechatBindCard({ wechatBind, hasPassword }: WechatBindCardProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [unbinding, setUnbinding] = useState(false)
  const [error, setError] = useState('')

  const handleUnbind = async () => {
    if (!confirm('确定要解绑微信吗？解绑后将无法使用微信登录。')) {
      return
    }

    setUnbinding(true)
    setError('')

    try {
      const res = await fetch('/api/auth/wechat/unbind', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '解绑失败')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '解绑失败')
    } finally {
      setUnbinding(false)
    }
  }

  return (
    <>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
          </svg>
          微信绑定
        </h3>

        {wechatBind ? (
          <div className="space-y-4">
            {/* 已绑定信息 */}
            <div className="flex items-center gap-4">
              {wechatBind.avatar ? (
                <img
                  src={wechatBind.avatar}
                  alt={wechatBind.nickname || '微信用户'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                  </svg>
                </div>
              )}
              <div>
                <p className="text-white font-medium">
                  {wechatBind.nickname || '微信用户'}
                </p>
                <p className="text-gray-400 text-sm">
                  绑定于 {new Date(wechatBind.bindAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>

            {/* 解绑按钮 */}
            {hasPassword ? (
              <button
                onClick={handleUnbind}
                disabled={unbinding}
                className="flex items-center gap-2 px-4 py-2 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                {unbinding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                {unbinding ? '解绑中...' : '解绑微信'}
              </button>
            ) : (
              <p className="text-yellow-500 text-sm">
                请先设置邮箱和密码后才能解绑微信
              </p>
            )}

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400">
              绑定微信后，可以使用微信扫码快速登录
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              绑定微信
            </button>
          </div>
        )}
      </div>

      {/* 绑定弹窗 */}
      <WechatLoginModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        scene="bind"
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
