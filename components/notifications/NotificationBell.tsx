'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  MessageCircle,
  Heart,
  AtSign,
  Info,
  UserPlus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'COMMENT_REPLY' | 'POST_LIKE' | 'NEW_FOLLOWER' | 'SYSTEM' | 'MENTION'
  title: string
  content: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

const typeIcons = {
  COMMENT_REPLY: MessageCircle,
  POST_LIKE: Heart,
  NEW_FOLLOWER: UserPlus,
  SYSTEM: Info,
  MENTION: AtSign,
}

const typeColors = {
  COMMENT_REPLY: 'text-cyber-cyan',
  POST_LIKE: 'text-cyber-pink',
  NEW_FOLLOWER: 'text-cyber-purple',
  SYSTEM: 'text-cyber-yellow',
  MENTION: 'text-cyber-green',
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
        setIsLoggedIn(true)
      } else if (res.status === 401) {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      const notification = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const clearAll = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', { method: 'DELETE' })
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-cyber-cyan transition-colors"
        aria-label="通知"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-pink text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-cyber-dark border border-cyber-cyan/30 rounded-lg shadow-xl shadow-cyber-cyan/10 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-cyber-cyan/20">
                <h3 className="font-cyber text-lg text-white">通知</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      disabled={loading}
                      className="p-1.5 text-gray-400 hover:text-cyber-cyan transition-colors"
                      title="全部标为已读"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      disabled={loading}
                      className="p-1.5 text-gray-400 hover:text-cyber-pink transition-colors"
                      title="清空所有"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 font-mono">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无通知</p>
                  </div>
                ) : (
                  <div className="divide-y divide-cyber-cyan/10">
                    {notifications.map(notification => {
                      const Icon = typeIcons[notification.type]
                      const colorClass = typeColors[notification.type]

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`p-4 hover:bg-cyber-cyan/5 transition-colors ${
                            !notification.isRead ? 'bg-cyber-cyan/10' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`flex-shrink-0 ${colorClass}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {notification.link ? (
                                <Link
                                  href={notification.link}
                                  onClick={() => {
                                    if (!notification.isRead) {
                                      markAsRead(notification.id)
                                    }
                                    setIsOpen(false)
                                  }}
                                  className="block"
                                >
                                  <p className="text-sm font-medium text-white hover:text-cyber-cyan transition-colors">
                                    {notification.title}
                                  </p>
                                  {notification.content && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                      {notification.content}
                                    </p>
                                  )}
                                </Link>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-white">
                                    {notification.title}
                                  </p>
                                  {notification.content && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                      {notification.content}
                                    </p>
                                  )}
                                </>
                              )}
                              <p className="text-xs text-gray-500 mt-1 font-mono">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: zhCN,
                                })}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex items-start gap-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-500 hover:text-cyber-cyan transition-colors"
                                  title="标为已读"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-gray-500 hover:text-cyber-pink transition-colors"
                                title="删除"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-cyber-cyan/20 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-cyber-cyan hover:text-cyber-pink transition-colors font-mono"
                  >
                    查看全部通知
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
