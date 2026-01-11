'use client'

import { motion } from 'framer-motion'
import { PictureInPicture2 } from 'lucide-react'
import { useVideo } from '../VideoContext'

export function PiPButton() {
  const { state, actions } = useVideo()

  // Check if PiP is supported
  if (typeof document !== 'undefined' && !document.pictureInPictureEnabled) {
    return null
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={actions.togglePiP}
      className={`p-2 transition-colors ${
        state.isPiP
          ? 'text-cyber-cyan'
          : 'text-white hover:text-cyber-cyan'
      }`}
      title={state.isPiP ? '退出画中画 (P)' : '画中画 (P)'}
    >
      <PictureInPicture2 className="w-5 h-5" />
    </motion.button>
  )
}
