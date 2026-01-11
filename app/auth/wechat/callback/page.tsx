'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function WechatCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      setStatus('error')
      setMessage(decodeURIComponent(error))
      return
    }

    if (state) {
      setStatus('success')
      setMessage('授权成功，正在处理...')

      // 如果是在弹窗中打开的，通知父窗口
      if (window.opener) {
        window.opener.postMessage(
          { type: 'wechat-callback', state },
          window.location.origin
        )
        // 延迟关闭窗口
        setTimeout(() => {
          window.close()
        }, 1000)
      } else {
        // 如果不是弹窗，重定向到首页
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
    } else {
      setStatus('error')
      setMessage('无效的回调参数')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-cyber-cyan animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">正在处理...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-cyber-green mx-auto" />
            <p className="text-cyber-green mt-4 text-lg">{message}</p>
            <p className="text-gray-500 mt-2 text-sm">
              {window.opener ? '窗口即将关闭...' : '即将跳转...'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-red-400 mt-4 text-lg">{message}</p>
            <button
              onClick={() => window.close()}
              className="mt-6 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              关闭窗口
            </button>
          </>
        )}
      </div>
    </div>
  )
}
