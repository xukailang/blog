'use client'

import { motion } from 'framer-motion'
import { Maximize, Minimize } from 'lucide-react'
import { useVideo } from '../VideoContext'

export function FullscreenButton() {
  const { state, actions } = useVideo()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={actions.toggleFullscreen}
      className="p-2 text-white hover:text-cyber-cyan transition-colors"
      title={state.isFullscreen ? '退出全屏 (F)' : '全屏 (F)'}
    >
      {state.isFullscreen ? (
        <Minimize className="w-5 h-5" />
      ) : (
        <Maximize className="w-5 h-5" />
      )}
    </motion.button>
  )
}
