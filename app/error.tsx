'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NeonBorder from '@/components/effects/NeonBorder'
import GlitchText from '@/components/ui/GlitchText'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <NeonBorder color="pink" className="p-8 bg-cyber-dark/50 text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-16 h-16 mx-auto text-cyber-yellow mb-6" />
          </motion.div>

          <GlitchText
            text="页面错误"
            as="h1"
            className="text-2xl font-bold text-cyber-cyan mb-4"
          />

          <p className="text-gray-400 font-mono text-sm mb-6">
            加载此页面时出现问题
            <br />
            请尝试刷新或返回上一页
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-3 bg-cyber-black/50 rounded-lg text-left overflow-auto max-h-24">
              <p className="text-cyber-pink text-xs font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-pink text-cyber-black rounded-lg font-cyber uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              重试
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 border border-cyber-cyan/50 text-cyber-cyan rounded-lg font-cyber text-sm uppercase tracking-wider hover:bg-cyber-cyan/10 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </motion.button>

              <Link href="/" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 border border-cyber-pink/50 text-cyber-pink rounded-lg font-cyber text-sm uppercase tracking-wider hover:bg-cyber-pink/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  首页
                </motion.button>
              </Link>
            </div>
          </div>
        </NeonBorder>
      </motion.div>
    </div>
  )
}
