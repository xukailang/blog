'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ToastNotificationProps {
  message: string | null
}

export function ToastNotification({ message }: ToastNotificationProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyber-dark/90 border border-cyber-cyan/30 rounded-lg backdrop-blur-sm"
          style={{
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)',
          }}
        >
          <span className="text-sm font-mono text-cyber-cyan">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
