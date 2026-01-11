'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useVideo } from '../VideoContext'

export function PlayOverlay() {
  const { actions } = useVideo()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
      onClick={actions.togglePlay}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-cyber-cyan/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Button */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #00f5ff, #ff006e)',
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.5), 0 0 60px rgba(255, 0, 110, 0.3)',
          }}
        >
          <Play className="w-10 h-10 text-white ml-1" fill="white" />
        </div>
      </motion.div>
    </motion.div>
  )
}
