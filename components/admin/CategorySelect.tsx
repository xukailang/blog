'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
}

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setCategories([...categories, data.category])
        onChange(data.category.name)
        setNewCategory('')
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const selectedCategory = categories.find((c) => c.name === value)

  if (loading) {
    return (
      <div className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-500">
        加载中...
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedCategory?.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <span className={value ? 'text-white' : 'text-gray-500'}>
            {value || '选择分类'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Existing categories */}
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onChange(category.name)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-700 ${
                value === category.name ? 'bg-gray-700' : ''
              }`}
            >
              {category.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <span className="text-white">{category.name}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-gray-700 my-1" />

          {/* Create new category */}
          <div className="p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreateCategory()
                  }
                }}
                className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="新建分类..."
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
