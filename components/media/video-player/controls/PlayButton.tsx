'use client'

import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import { useVideo } from '../VideoContext'

export function PlayButton() {
  const { state, actions } = useVideo()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={actions.togglePlay}
      className="p-2 text-white hover:text-cyber-cyan transition-colors"
      title={state.isPlaying ? '暂停 (K)' : '播放 (K)'}
    >
      {state.isPlaying ? (
        <Pause className="w-5 h-5" fill="currentColor" />
      ) : (
        <Play className="w-5 h-5" fill="currentColor" />
      )}
    </motion.button>
  )
}
