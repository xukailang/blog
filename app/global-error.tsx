'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertOctagon, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import NeonBorder from '@/components/effects/NeonBorder'
import GlitchText from '@/components/ui/GlitchText'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-cyber-black text-gray-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <NeonBorder color="pink" className="p-8 bg-cyber-dark/50 text-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertOctagon className="w-20 h-20 mx-auto text-cyber-pink mb-6" />
            </motion.div>

            <GlitchText
              text="系统错误"
              as="h1"
              className="text-3xl font-bold text-cyber-pink mb-4"
            />

            <p className="text-gray-400 font-mono mb-6">
              应用程序遇到了严重错误
              <br />
              请尝试刷新页面或返回首页
            </p>

            {error.digest && (
              <p className="text-xs text-gray-600 font-mono mb-6">
                错误代码: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-pink text-cyber-black rounded-lg font-cyber uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                重试
              </motion.button>

              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border border-cyber-cyan text-cyber-cyan rounded-lg font-cyber uppercase tracking-wider hover:bg-cyber-cyan/10 transition-colors flex items-center justify-center gap-2 w-full"
                >
                  <Home className="w-5 h-5" />
                  返回首页
                </motion.button>
              </Link>
            </div>
          </NeonBorder>
        </motion.div>
      </body>
    </html>
  )
}
