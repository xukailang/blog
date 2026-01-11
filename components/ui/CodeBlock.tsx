'use client'

import { useState, useRef, ReactNode } from 'react'
import { Check, Copy, Code } from 'lucide-react'

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

export default function CodeBlock({ children, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  // Extract language from className (e.g., "language-javascript")
  const language = className.replace(/language-/, '') || 'code'

  const copyToClipboard = async () => {
    if (preRef.current) {
      const code = preRef.current.textContent || ''
      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <div className="relative group my-4">
      {/* Language Badge */}
      <div className="absolute top-0 left-4 -translate-y-1/2 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono uppercase tracking-wider bg-cyber-dark border border-cyber-cyan/50 rounded text-cyber-cyan">
          <Code className="w-3 h-3" />
          {language}
        </span>
      </div>

      {/* Copy Button */}
      <button
        onClick={copyToClipboard}
        className={`absolute top-3 right-3 z-10 p-2 rounded-lg transition-all duration-300 ${
          copied
            ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
            : 'bg-cyber-dark/80 border-cyber-cyan/30 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-cyber-cyan hover:border-cyber-cyan'
        } border`}
        title={copied ? '已复制!' : '复制代码'}
        aria-label={copied ? '已复制' : '复制代码'}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Code Block */}
      <pre
        ref={preRef}
        className={`bg-cyber-dark p-4 pt-8 rounded-lg overflow-x-auto border border-cyber-cyan/30 shadow-lg shadow-cyber-cyan/10 ${className}`}
      >
        {children}
      </pre>

      {/* Copy Success Toast */}
      {copied && (
        <div className="absolute top-3 right-14 z-10 px-2 py-1 text-xs font-mono bg-cyber-green/20 border border-cyber-green/50 rounded text-cyber-green animate-fade-in">
          已复制!
        </div>
      )}
    </div>
  )
}
