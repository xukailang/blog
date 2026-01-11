'use client'

import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useVideo } from '../VideoContext'

export function ScreenshotButton() {
  const { actions } = useVideo()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={actions.takeScreenshot}
      className="p-2 text-white hover:text-cyber-cyan transition-colors"
      title="截图 (S)"
    >
      <Camera className="w-5 h-5" />
    </motion.button>
  )
}
