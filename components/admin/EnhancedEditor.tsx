'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  Bold, Italic, Code, Link, Image, Quote, List, ListOrdered,
  Heading1, Heading2, Heading3, Table, Minus, Upload, Undo, Redo,
  Search, Maximize2, Minimize2, Eye, EyeOff, Keyboard, Smile, X,
} from 'lucide-react'
import EmojiPicker from './editor/EmojiPicker'
import AutoSaveIndicator, { SaveStatus } from './editor/AutoSaveIndicator'

interface EnhancedEditorProps {
  content: string
  onChange: (content: string) => void
  onPreviewToggle?: (show: boolean) => void
  enableAutoSave?: boolean
  autoSaveStatus?: SaveStatus
  lastSavedAt?: Date | null
}

interface HistoryState {
  content: string
  cursorPos: number
}

export default function EnhancedEditor({
  content, onChange, onPreviewToggle,
  enableAutoSave = false, autoSaveStatus = 'idle', lastSavedAt = null,
}: EnhancedEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [history, setHistory] = useState<HistoryState[]>([{ content, cursorPos: 0 }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [wordCount, setWordCount] = useState({ chars: 0, words: 0, lines: 0 })

  useEffect(() => {
    const chars = content.length
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    const lines = content.split('\n').length
    setWordCount({ chars, words, lines })
  }, [content])

  const saveHistory = useCallback((newContent: string, cursorPos: number) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ content: newContent, cursorPos })
      if (newHistory.length > 100) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 99))
  }, [historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const state = history[newIndex]
      onChange(state.content)
      setTimeout(() => textareaRef.current?.setSelectionRange(state.cursorPos, state.cursorPos), 0)
    }
  }, [history, historyIndex, onChange])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const state = history[newIndex]
      onChange(state.content)
      setTimeout(() => textareaRef.current?.setSelectionRange(state.cursorPos, state.cursorPos), 0)
    }
  }, [history, historyIndex, onChange])

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || placeholder
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    onChange(newText)
    saveHistory(newText, start + before.length + selectedText.length)
    setTimeout(() => {
      textarea.focus()
      if (selectedText === placeholder) {
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length)
      } else {
        const newCursorPos = start + before.length + selectedText.length + after.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }, [content, onChange, saveHistory])

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newText = content.substring(0, lineStart) + prefix + content.substring(lineStart)
    onChange(newText)
    saveHistory(newText, start + prefix.length)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }, [content, onChange, saveHistory])

  const handleEmojiSelect = useCallback((emoji: string) => {
    insertText(emoji)
    setShowEmojiPicker(false)
  }, [insertText])

  const insertTable = () => insertText('\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n')
  const insertCodeBlock = (lang: string = '') => insertText('\n```' + lang + '\n', '\n```\n', '// 代码')

  const toolbarButtons = [
    { icon: Heading1, action: () => insertAtLineStart('# '), title: '标题1' },
    { icon: Heading2, action: () => insertAtLineStart('## '), title: '标题2' },
    { icon: Heading3, action: () => insertAtLineStart('### '), title: '标题3' },
    { type: 'divider' },
    { icon: Bold, action: () => insertText('**', '**', '粗体'), title: '加粗' },
    { icon: Italic, action: () => insertText('*', '*', '斜体'), title: '斜体' },
    { icon: Code, action: () => insertText('`', '`', 'code'), title: '代码' },
    { type: 'divider' },
    { icon: Link, action: () => insertText('[', '](url)', '链接'), title: '链接' },
    { icon: Image, action: () => insertText('![', '](url)', 'alt'), title: '图片' },
    { icon: Quote, action: () => insertAtLineStart('> '), title: '引用' },
    { type: 'divider' },
    { icon: List, action: () => insertAtLineStart('- '), title: '列表' },
    { icon: ListOrdered, action: () => insertAtLineStart('1. '), title: '有序列表' },
    { icon: Table, action: insertTable, title: '表格' },
    { icon: Minus, action: () => insertText('\n---\n'), title: '分割线' },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) insertText(`![${file.name}](${data.url})`)
      else alert(data.error || '上传失败')
    } catch { alert('上传失败') }
    e.target.value = ''
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
          const data = await res.json()
          if (res.ok && data.url) insertText(`![image](${data.url})`)
        } catch { console.error('Paste upload failed') }
        return
      }
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) insertText(`![${file.name}](${data.url})`)
    } catch { console.error('Drop upload failed') }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': e.preventDefault(); insertText('**', '**', '粗体'); break
        case 'i': e.preventDefault(); insertText('*', '*', '斜体'); break
        case 'k': e.preventDefault(); insertText('[', '](url)', '链接'); break
        case 'q': e.preventDefault(); insertAtLineStart('> '); break
        case '1': e.preventDefault(); insertAtLineStart('# '); break
        case '2': e.preventDefault(); insertAtLineStart('## '); break
        case '3': e.preventDefault(); insertAtLineStart('### '); break
        case 'z': e.preventDefault(); e.shiftKey ? handleRedo() : handleUndo(); break
        case 'y': e.preventDefault(); handleRedo(); break
        case 'f': e.preventDefault(); setShowSearch(true); break
      }
    }
    if (e.key === 'Tab') { e.preventDefault(); insertText('  ') }
  }

  const handleFind = () => {
    if (!searchText) return
    const textarea = textareaRef.current
    if (!textarea) return
    let index = content.indexOf(searchText, textarea.selectionEnd)
    if (index === -1) index = content.indexOf(searchText)
    if (index !== -1) { textarea.setSelectionRange(index, index + searchText.length); textarea.focus() }
  }

  const handleReplace = () => {
    if (!searchText) return
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    if (content.substring(start, end) === searchText) {
      const newContent = content.substring(0, start) + replaceText + content.substring(end)
      onChange(newContent)
      saveHistory(newContent, start + replaceText.length)
    }
    handleFind()
  }

  const handleReplaceAll = () => {
    if (!searchText) return
    const newContent = content.split(searchText).join(replaceText)
    onChange(newContent)
    saveHistory(newContent, 0)
  }

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="p-2 flex flex-wrap items-center gap-1"
        style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
        <button type="button" onClick={handleUndo} disabled={historyIndex <= 0}
          className="p-1.5 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-30" title="撤销">
          <Undo className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-30" title="重做">
          <Redo className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />
        {toolbarButtons.map((btn, i) => btn.type === 'divider' ? (
          <div key={i} className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />
        ) : (
          <button key={i} type="button" onClick={btn.action}
            className="p-1.5 rounded hover:bg-[var(--bg-secondary)]" title={btn.title}>
            <btn.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        ))}
        <div className="relative">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 rounded hover:bg-[var(--bg-secondary)]" title="表情">
            <Smile className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <AnimatePresence>
            {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
          </AnimatePresence>
        </div>
        <select onChange={(e) => { if (e.target.value) { insertCodeBlock(e.target.value); e.target.value = '' } }}
          className="px-2 py-1 text-xs rounded"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
          <option value="">代码块</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
          <option value="json">JSON</option>
        </select>
        <label className="p-1.5 rounded cursor-pointer" style={{ backgroundColor: 'var(--accent-primary)' }} title="上传">
          <Upload className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <div className="flex-1" />
        {enableAutoSave && <AutoSaveIndicator status={autoSaveStatus} lastSavedAt={lastSavedAt} />}
        <button type="button" onClick={() => setShowSearch(!showSearch)} className="p-1.5 rounded hover:bg-[var(--bg-secondary)]" title="查找">
          <Search className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button type="button" onClick={() => setShowShortcuts(!showShortcuts)} className="p-1.5 rounded hover:bg-[var(--bg-secondary)]" title="快捷键">
          <Keyboard className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button type="button" onClick={() => { setShowPreview(!showPreview); onPreviewToggle?.(!showPreview) }}
          className="p-1.5 rounded hover:bg-[var(--bg-secondary)]" title="预览">
          {showPreview ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
        </button>
        <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded hover:bg-[var(--bg-secondary)]" title="全屏">
          {isFullscreen ? <Minimize2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <Maximize2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
        </button>
      </div>
      {showSearch && (
        <div className="p-2 flex items-center gap-2" style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
          <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="查找"
            className="px-2 py-1 text-sm rounded flex-1 max-w-[200px]"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            onKeyDown={(e) => e.key === 'Enter' && handleFind()} />
          <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="替换"
            className="px-2 py-1 text-sm rounded flex-1 max-w-[200px]"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
          <button onClick={handleFind} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>查找</button>
          <button onClick={handleReplace} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>替换</button>
          <button onClick={handleReplaceAll} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>全部</button>
          <button onClick={() => setShowSearch(false)} className="p-1 rounded hover:bg-[var(--bg-secondary)]">
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      )}
      <textarea ref={textareaRef} value={content} onChange={(e) => onChange(e.target.value)}
        onBlur={() => { if (content !== history[historyIndex]?.content) saveHistory(content, textareaRef.current?.selectionStart || 0) }}
        onKeyDown={handleKeyDown} onPaste={handlePaste} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
        className={`w-full p-4 font-mono text-sm resize-none focus:outline-none ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        placeholder="在这里写 Markdown 内容..." />
      <div className="px-4 py-1 flex items-center justify-between text-xs"
        style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-4">
          <span>{wordCount.chars} 字符</span>
          <span>{wordCount.words} 词</span>
          <span>{wordCount.lines} 行</span>
        </div>
        <div>Markdown</div>
      </div>
      {showShortcuts && (
        <div className="absolute right-4 top-16 p-4 rounded-lg shadow-lg z-10"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>快捷键</h4>
          <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div>Ctrl+B - 加粗</div>
            <div>Ctrl+I - 斜体</div>
            <div>Ctrl+K - 链接</div>
            <div>Ctrl+Q - 引用</div>
            <div>Ctrl+1/2/3 - 标题</div>
            <div>Ctrl+Z/Y - 撤销/重做</div>
            <div>Ctrl+F - 查找</div>
          </div>
        </div>
      )}
    </div>
  )
}
