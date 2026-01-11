import type { MDXComponents } from 'mdx/types'
import CodeBlock from '@/components/ui/CodeBlock'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-cyber font-bold text-cyber-cyan mb-6 animate-pulse-neon">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-cyber font-bold text-cyber-pink mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-cyber font-semibold text-cyber-purple mt-6 mb-3">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-4 font-mono">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-cyber-cyan hover:text-cyber-pink transition-colors underline decoration-cyber-cyan/50 hover:decoration-cyber-pink"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    code: ({ children, className }) => {
      // Inline code (no className) vs code block (has className from language)
      if (!className) {
        return (
          <code className="bg-cyber-dark px-2 py-1 rounded text-cyber-green font-mono text-sm border border-cyber-cyan/30">
            {children}
          </code>
        )
      }
      // Code inside pre block - just return with styling
      return (
        <code className={`text-gray-300 font-mono text-sm ${className}`}>
          {children}
        </code>
      )
    },
    pre: ({ children }) => {
      // Extract className from the code child if it exists
      const codeChild = children as React.ReactElement
      const className = codeChild?.props?.className || ''
      return (
        <CodeBlock className={className}>
          {children}
        </CodeBlock>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-cyber-pink pl-4 my-4 italic text-gray-400 bg-cyber-dark/50 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ol>
    ),
    ...components,
  }
}
