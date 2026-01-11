'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, Check, Loader2 } from 'lucide-react'
import NeonBorder from '@/components/effects/NeonBorder'

interface NewsletterFormProps {
  variant?: 'default' | 'compact' | 'inline'
  className?: string
}

export default function NewsletterForm({ variant = 'default', className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('请输入邮箱地址')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || '订阅成功！')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
        setMessage(data.error || '订阅失败，请稍后重试')
      }
    } catch {
      setStatus('error')
      setMessage('网络错误，请稍后重试')
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="输入邮箱订阅"
          className="flex-1 px-3 py-2 bg-cyber-dark border border-cyber-cyan/30 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan font-mono"
          disabled={status === 'loading' || status === 'success'}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="px-4 py-2 bg-cyber-cyan text-cyber-black rounded font-cyber text-sm disabled:opacity-50"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </form>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan font-mono"
            disabled={status === 'loading' || status === 'success'}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-pink text-cyber-black rounded-lg font-cyber uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                订阅中...
              </>
            ) : status === 'success' ? (
              <>
                <Check className="w-5 h-5" />
                已订阅
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                订阅
              </>
            )}
          </motion.button>
        </form>
        {message && (
          <p className={`mt-2 text-sm font-mono ${status === 'error' ? 'text-cyber-pink' : 'text-cyber-green'}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <NeonBorder color="cyan" className={`p-6 bg-cyber-dark/50 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-pink flex items-center justify-center">
          <Mail className="w-5 h-5 text-cyber-black" />
        </div>
        <div>
          <h3 className="font-cyber text-lg text-white">订阅更新</h3>
          <p className="text-xs text-gray-500 font-mono">获取最新文章推送</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="你的名字（可选）"
          className="w-full px-4 py-2 bg-cyber-black border border-cyber-cyan/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan font-mono text-sm"
          disabled={status === 'loading' || status === 'success'}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2 bg-cyber-black border border-cyber-cyan/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan font-mono text-sm"
          disabled={status === 'loading' || status === 'success'}
          required
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full py-3 bg-gradient-to-r from-cyber-cyan to-cyber-pink text-cyber-black rounded-lg font-cyber uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              订阅中...
            </>
          ) : status === 'success' ? (
            <>
              <Check className="w-5 h-5" />
              订阅成功
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              立即订阅
            </>
          )}
        </motion.button>
      </form>

      {message && (
        <p className={`mt-3 text-sm font-mono text-center ${status === 'error' ? 'text-cyber-pink' : 'text-cyber-green'}`}>
          {message}
        </p>
      )}

      <p className="mt-4 text-xs text-gray-600 font-mono text-center">
        我们尊重你的隐私，随时可以退订
      </p>
    </NeonBorder>
  )
}
