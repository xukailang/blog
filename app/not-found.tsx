'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import GlitchText from '@/components/ui/GlitchText'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text="404"
            as="h1"
            className="text-8xl md:text-9xl font-bold text-cyber-pink mb-4"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-cyber text-2xl text-cyber-cyan mb-4">
            页面未找到
          </h2>
          <p className="text-gray-500 font-mono mb-8 max-w-md mx-auto">
            你访问的页面似乎已经消失在数字虚空中...
            也许它从未存在过？
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cyber-button text-white rounded-lg flex items-center gap-2 justify-center"
              >
                <Home className="w-5 h-5" />
                返回首页
              </motion.button>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-cyber-cyan text-cyber-cyan rounded-lg font-cyber uppercase tracking-wider hover:bg-cyber-cyan/10 transition-colors flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
              返回上页
            </button>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
          className="mt-16 font-mono text-xs text-gray-600"
        >
          <p>ERROR_CODE: PAGE_NOT_FOUND</p>
          <p>STATUS: 404</p>
          <p>LOCATION: UNKNOWN</p>
        </motion.div>
      </div>
    </div>
  )
}
