'use client'

import { motion } from 'framer-motion'
import { Repeat, Repeat1 } from 'lucide-react'
import { useVideo } from '../VideoContext'

export function LoopButton() {
  const { state, actions } = useVideo()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={actions.toggleLoop}
      className={`p-2 transition-colors ${
        state.isLoop
          ? 'text-cyber-cyan'
          : 'text-white hover:text-cyber-cyan'
      }`}
      title={state.isLoop ? '取消循环 (O)' : '循环播放 (O)'}
    >
      {state.isLoop ? (
        <Repeat1 className="w-5 h-5" />
      ) : (
        <Repeat className="w-5 h-5" />
      )}
    </motion.button>
  )
}
