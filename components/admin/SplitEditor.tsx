'use client'

import { useState } from 'react'
import PostEditor from './PostEditor'
import MarkdownPreview from './MarkdownPreview'

interface SplitEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function SplitEditor({ content, onChange }: SplitEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split')

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-400">内容编辑器</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLayout('editor')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              layout === 'editor'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => setLayout('split')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              layout === 'split'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            分屏
          </button>
          <button
            type="button"
            onClick={() => setLayout('preview')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              layout === 'preview'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`grid ${layout === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        {layout !== 'preview' && (
          <div className={layout === 'split' ? 'border-r border-gray-700' : ''}>
            <PostEditor content={content} onChange={onChange} />
          </div>
        )}

        {/* Preview */}
        {layout !== 'editor' && (
          <div className="bg-gray-900 p-4 overflow-auto max-h-[600px]">
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>
    </div>
  )
}
