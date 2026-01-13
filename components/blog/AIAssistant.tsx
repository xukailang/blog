'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  postSlug: string
  postTitle: string
}

export default function AIAssistant({ postSlug, postTitle }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [summary, setSummary] = useState<string>('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 获取推荐问题
  const fetchSuggestedQuestions = async () => {
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug, type: 'questions' }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuggestedQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Failed to fetch suggested questions:', error)
    }
  }

  // 获取文章摘要
  const fetchSummary = async () => {
    setLoadingSummary(true)
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug, type: 'summary' }),
      })

      if (res.ok) {
        const data = await res.json()
        setSummary(data.summary || '')
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    } finally {
      setLoadingSummary(false)
    }
  }

  // 打开助手时获取推荐问题
  useEffect(() => {
    if (isOpen && suggestedQuestions.length === 0) {
      fetchSuggestedQuestions()
    }
  }, [isOpen])

  // 发送消息
  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, postSlug }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const error = await res.json()
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `抱歉，出现了错误：${error.error || '未知错误'}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，网络出现问题，请稍后再试。',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-transform hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            }}
            title="AI 助手"
          >
            <Bot className="w-6 h-6" style={{ color: 'var(--bg-primary)' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* 头部 */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              }}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
                <span className="font-medium" style={{ color: 'var(--bg-primary)' }}>
                  AI 助手
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  {isMinimized ? (
                    <ChevronUp className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                >
                  {/* 消息列表 */}
                  <div
                    className="h-80 overflow-y-auto p-4 space-y-4"
                    style={{ backgroundColor: 'var(--bg-primary)' }}
                  >
                    {/* 欢迎消息 */}
                    {messages.length === 0 && (
                      <div className="text-center py-4">
                        <Sparkles
                          className="w-12 h-12 mx-auto mb-3"
                          style={{ color: 'var(--accent-primary)' }}
                        />
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                          你好！我是 AI 助手，可以帮你解答关于这篇文章的问题。
                        </p>

                        {/* 摘要按钮 */}
                        {!summary && (
                          <button
                            onClick={fetchSummary}
                            disabled={loadingSummary}
                            className="px-4 py-2 rounded-lg text-sm mb-4 transition-colors"
                            style={{
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {loadingSummary ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                生成摘要中...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                生成文章摘要
                              </span>
                            )}
                          </button>
                        )}

                        {/* 摘要显示 */}
                        {summary && (
                          <div
                            className="text-left p-3 rounded-lg mb-4"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                          >
                            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                              文章摘要
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {summary}
                            </p>
                          </div>
                        )}

                        {/* 推荐问题 */}
                        {suggestedQuestions.length > 0 && (
                          <div className="text-left">
                            <p
                              className="text-xs mb-2"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              你可能想问：
                            </p>
                            <div className="space-y-2">
                              {suggestedQuestions.map((q, i) => (
                                <button
                                  key={i}
                                  onClick={() => sendMessage(q)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                                  style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-secondary)',
                                  }}
                                >
                                  <MessageSquare className="w-3 h-3 inline mr-2" />
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 消息 */}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            message.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                          }`}
                          style={{
                            backgroundColor:
                              message.role === 'user'
                                ? 'var(--accent-primary)'
                                : 'var(--bg-tertiary)',
                            color:
                              message.role === 'user'
                                ? 'var(--bg-primary)'
                                : 'var(--text-primary)',
                          }}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* 加载中 */}
                    {loading && (
                      <div className="flex justify-start">
                        <div
                          className="px-4 py-2 rounded-lg rounded-bl-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                          <Loader2
                            className="w-5 h-5 animate-spin"
                            style={{ color: 'var(--accent-primary)' }}
                          />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* 输入框 */}
                  <form
                    onSubmit={handleSubmit}
                    className="p-3 flex gap-2"
                    style={{ borderTop: '1px solid var(--border-color)' }}
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="输入你的问题..."
                      disabled={loading}
                      className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="p-2 rounded-lg transition-colors disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    >
                      <Send className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
