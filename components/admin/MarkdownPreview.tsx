'use client'

import { useMemo } from 'react'
import { marked } from 'marked'

interface MarkdownPreviewProps {
  content: string
}

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const html = useMemo(() => {
    if (!content) return ''
    try {
      return marked(content) as string
    } catch {
      return '<p class="text-red-400">Markdown 解析错误</p>'
    }
  }, [content])

  if (!content) {
    return (
      <div className="text-gray-500 italic">
        在左侧输入 Markdown 内容，这里会实时预览...
      </div>
    )
  }

  return (
    <div
      className="prose prose-invert prose-cyan max-w-none
        prose-headings:text-cyan-400 prose-headings:border-b prose-headings:border-gray-700 prose-headings:pb-2
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-code:text-cyan-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
        prose-blockquote:border-l-cyan-500 prose-blockquote:text-gray-400
        prose-ul:text-gray-300 prose-ol:text-gray-300
        prose-li:marker:text-cyan-500
        prose-hr:border-gray-700
        prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
