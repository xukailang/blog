'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Loader2 } from 'lucide-react'

interface GithubLoginButtonProps {
  action?: 'login' | 'bind'
  className?: string
  variant?: 'default' | 'outline'
}

export default function GithubLoginButton({
  action = 'login',
  className = '',
  variant = 'default',
}: GithubLoginButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    setLoading(true)
    window.location.href = `/api/auth/github?action=${action}`
  }

  const baseStyles = 'w-full py-3 rounded-lg font-cyber uppercase tracking-wider flex items-center justify-center gap-2 transition-all'

  const variantStyles = {
    default: 'bg-[#24292e] hover:bg-[#2f363d] text-white',
    outline: 'border border-[#24292e] text-[#24292e] hover:bg-[#24292e] hover:text-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className} disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Github className="w-5 h-5" />
      )}
      {action === 'login' ? '使用 GitHub 登录' : '绑定 GitHub'}
    </motion.button>
  )
}
