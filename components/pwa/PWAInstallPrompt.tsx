'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope)
        })
        .catch((error) => {
          console.error('SW registration failed:', error)
        })
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay (don't be too aggressive)
      const dismissed = localStorage.getItem('pwa-prompt-dismissed')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 30000) // Show after 30 seconds
      }
    }

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (isInstalled || !deferredPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-cyber-dark border border-cyber-cyan/30 rounded-lg shadow-xl shadow-cyber-cyan/10 p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-pink flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-cyber-black" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-cyber text-white text-sm mb-1">
                  安装 CyberBlog
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  将应用添加到主屏幕，获得更好的体验
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 text-sm font-mono text-gray-400 hover:text-white transition-colors"
              >
                稍后再说
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyber-cyan to-cyber-pink text-cyber-black text-sm font-cyber rounded-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                安装
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
