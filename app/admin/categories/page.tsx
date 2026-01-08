'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  _count: {
    postMeta: number
  }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#06b6d4',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  const checkAuthAndFetch = async () => {
    const authRes = await fetch('/api/admin/auth/check')
    const authData = await authRes.json()
    if (!authData.authenticated) {
      router.push('/admin/login')
      return
    }
    fetchCategories()
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchCategories()
        resetForm()
      } else {
        const data = await res.json()
        alert(data.error || '操作失败')
      }
    } catch {
      alert('操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#06b6d4',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCategories()
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', color: '#06b6d4' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-cyan-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <h1 className="text-lg font-medium text-white">分类管理</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            + 新建分类
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <h2 className="text-lg font-medium text-white mb-4">
                {editingId ? '编辑分类' : '新建分类'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                    placeholder="分类名称"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white resize-none"
                    placeholder="分类描述（可选）"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无分类，点击上方按钮创建
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#06b6d4' }}
                  />
                  <div>
                    <h3 className="text-white font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-400 text-sm">
                        {category.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {category._count.postMeta} 篇文章
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
