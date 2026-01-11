'use client'

import { motion } from 'framer-motion'

export function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-cyber-cyan/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner spinning arc */}
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-cyber-cyan border-r-cyber-pink"
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber-cyan"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)',
          }}
        />
      </div>
    </motion.div>
  )
}
