'use client'

import { useRef, useCallback } from 'react'

interface PostEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function PostEditor({ content, onChange }: PostEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content, onChange])

  const handleBold = () => insertText('**', '**')
  const handleItalic = () => insertText('*', '*')
  const handleCode = () => insertText('`', '`')
  const handleCodeBlock = () => insertText('\n```\n', '\n```\n')
  const handleLink = () => insertText('[', '](url)')
  const handleImage = () => insertText('![alt](', ')')
  const handleH1 = () => insertText('# ')
  const handleH2 = () => insertText('## ')
  const handleH3 = () => insertText('### ')
  const handleQuote = () => insertText('> ')
  const handleList = () => insertText('- ')
  const handleOrderedList = () => insertText('1. ')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.url) {
        insertText(`![${file.name}](${data.url})`)
      } else {
        alert(data.error || '上传失败')
      }
    } catch {
      alert('上传失败')
    }

    e.target.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.url) {
        insertText(`![${file.name}](${data.url})`)
      } else {
        alert(data.error || '上传失败')
      }
    } catch {
      alert('上传失败')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={handleH1}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="标题1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={handleH2}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="标题2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={handleH3}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="标题3"
        >
          H3
        </button>
        <div className="w-px bg-gray-600 mx-1" />
        <button
          type="button"
          onClick={handleBold}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded font-bold"
          title="加粗"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded italic"
          title="斜体"
        >
          I
        </button>
        <button
          type="button"
          onClick={handleCode}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded font-mono"
          title="行内代码"
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={handleCodeBlock}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="代码块"
        >
          Code
        </button>
        <div className="w-px bg-gray-600 mx-1" />
        <button
          type="button"
          onClick={handleLink}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="链接"
        >
          Link
        </button>
        <button
          type="button"
          onClick={handleImage}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="图片"
        >
          Img
        </button>
        <label className="px-2 py-1 text-sm bg-cyan-700 hover:bg-cyan-600 rounded cursor-pointer" title="上传图片">
          Upload
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        <div className="w-px bg-gray-600 mx-1" />
        <button
          type="button"
          onClick={handleQuote}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="引用"
        >
          Quote
        </button>
        <button
          type="button"
          onClick={handleList}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="无序列表"
        >
          List
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          title="有序列表"
        >
          1.
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-y focus:outline-none"
        placeholder="在这里写 Markdown 内容...&#10;&#10;支持拖拽上传图片"
      />
    </div>
  )
}
