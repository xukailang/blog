'use client'

import { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import Link from 'next/link'
import NeonBorder from '@/components/effects/NeonBorder'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // In production, you could send this to an error tracking service
    // logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <NeonBorder color="pink" className="p-8 bg-cyber-dark/50 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <AlertTriangle className="w-16 h-16 mx-auto text-cyber-pink mb-4" />
              </motion.div>

              <h2 className="font-cyber text-2xl text-white mb-2">
                出错了
              </h2>
              <p className="text-gray-400 font-mono text-sm mb-6">
                页面遇到了一些问题，请尝试刷新或返回首页
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-cyber-black/50 rounded-lg text-left overflow-auto max-h-32">
                  <p className="text-cyber-pink text-xs font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleRetry}
                  className="px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-pink text-cyber-black rounded-lg font-cyber uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  重试
                </motion.button>

                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border border-cyber-cyan text-cyber-cyan rounded-lg font-cyber uppercase tracking-wider hover:bg-cyber-cyan/10 transition-colors flex items-center justify-center gap-2 w-full"
                  >
                    <Home className="w-5 h-5" />
                    首页
                  </motion.button>
                </Link>
              </div>
            </NeonBorder>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

// Simple error fallback component
export function ErrorFallback({
  error,
  resetError,
}: {
  error?: Error
  resetError?: () => void
}) {
  return (
    <div className="p-4 border border-cyber-pink/30 rounded-lg bg-cyber-pink/5">
      <div className="flex items-start gap-3">
        <Bug className="w-5 h-5 text-cyber-pink flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-cyber-pink font-medium">加载失败</p>
          {error && (
            <p className="text-xs text-gray-500 font-mono mt-1 truncate">
              {error.message}
            </p>
          )}
        </div>
        {resetError && (
          <button
            onClick={resetError}
            className="text-xs text-cyber-cyan hover:text-cyber-pink transition-colors font-mono"
          >
            重试
          </button>
        )}
      </div>
    </div>
  )
}
