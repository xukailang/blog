'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Twitter, Facebook, Link2, Check, MessageCircle } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-400',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-600',
    },
    {
      name: 'WeChat',
      icon: MessageCircle,
      href: '#',
      color: 'hover:text-green-500',
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-gray-400 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-mono">分享</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 p-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg shadow-lg shadow-cyber-cyan/10 z-50"
          >
            <div className="flex gap-2">
              {shareLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 text-gray-400 ${link.color} transition-colors`}
                  title={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </motion.a>
              ))}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyToClipboard}
                className="p-2 text-gray-400 hover:text-cyber-cyan transition-colors"
                title="复制链接"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-cyber-green" />
                ) : (
                  <Link2 className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
