'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import GlitchText from '@/components/ui/GlitchText'
import NeonBorder from '@/components/effects/NeonBorder'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NeonBorder color="pink" className="p-8 bg-cyber-dark/50">
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.98, 1, 0.98],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-6"
            >
              <WifiOff className="w-20 h-20 mx-auto text-cyber-pink" />
            </motion.div>

            <GlitchText
              text="离线模式"
              as="h1"
              className="text-3xl font-bold text-cyber-cyan mb-4"
            />

            <p className="text-gray-400 font-mono mb-8">
              看起来你已经断开了网络连接。
              <br />
              请检查你的网络设置后重试。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="cyber-button text-white rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                重试连接
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

          <p className="mt-6 text-sm text-gray-500 font-mono">
            部分已缓存的内容可能仍然可用
          </p>
        </motion.div>
      </div>
    </div>
  )
}
