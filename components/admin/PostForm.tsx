'use client'

import { useState } from 'react'
import CategorySelect from './CategorySelect'

interface PostFormData {
  title: string
  description: string
  tags: string[]
  category: string
  coverImage: string
  date: string
}

interface PostFormProps {
  data: PostFormData
  onChange: (data: PostFormData) => void
}

export default function PostForm({ data, onChange }: PostFormProps) {
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleChange = (field: keyof PostFormData, value: string | string[]) => {
    onChange({ ...data, [field]: value })
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !data.tags.includes(tag)) {
      handleChange('tags', [...data.tags, tag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', data.tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (res.ok && result.url) {
        handleChange('coverImage', result.url)
      } else {
        alert(result.error || '上传失败')
      }
    } catch {
      alert('上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          标题 *
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
          placeholder="文章标题"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          描述
        </label>
        <textarea
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white resize-none"
          placeholder="文章简短描述"
          rows={2}
        />
      </div>

      {/* Date and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            日期
          </label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            分类
          </label>
          <CategorySelect
            value={data.category}
            onChange={(value) => handleChange('category', value)}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          标签
        </label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-cyan-900/50 text-cyan-400 text-sm rounded flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
            placeholder="输入标签后按回车添加"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          封面图片
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.coverImage}
            onChange={(e) => handleChange('coverImage', e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
            placeholder="https://example.com/image.jpg"
          />
          <label className={`px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? '上传中...' : '上传'}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        {data.coverImage && (
          <div className="mt-2">
            <img
              src={data.coverImage}
              alt="Cover preview"
              className="h-32 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
