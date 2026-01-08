'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditVlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    isPublished: false,
  })

  useEffect(() => {
    checkAuthAndFetch()
  }, [id])

  const checkAuthAndFetch = async () => {
    const authRes = await fetch('/api/admin/auth/check')
    const authData = await authRes.json()
    if (!authData.authenticated) {
      router.push('/admin/login')
      return
    }

    try {
      const res = await fetch(`/api/admin/vlogs/${id}`)
      if (!res.ok) {
        alert('视频不存在')
        router.push('/admin/vlogs')
        return
      }

      const data = await res.json()
      const vlog = data.vlog

      setFormData({
        title: vlog.title || '',
        description: vlog.description || '',
        videoUrl: vlog.videoUrl || '',
        thumbnailUrl: vlog.thumbnailUrl || '',
        duration: vlog.duration || 0,
        isPublished: vlog.isPublished || false,
      })
    } catch {
      alert('加载失败')
      router.push('/admin/vlogs')
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('thumbnail', file)
    formDataUpload.append('type', 'thumbnail')

    try {
      const res = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formDataUpload,
      })

      const result = await res.json()

      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          thumbnailUrl: result.url,
        }))
      } else {
        alert(result.error || '上传失败')
      }
    } catch {
      alert('上传失败')
    }
  }

  const handleSubmit = async () => {
    if (!formData.title) {
      alert('请输入标题')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/vlogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('保存成功')
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } catch {
      alert('保存失败')
    } finally {
      setSaving(false)
    }
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
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/vlogs"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 返回
            </Link>
            <h1 className="text-lg font-medium text-white">编辑 Vlog</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">视频预览</h2>
            <video
              src={formData.videoUrl}
              controls
              className="w-full rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-2">
              时长: {Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Thumbnail */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">封面图片</h2>

            <div className="flex items-start gap-4">
              {formData.thumbnailUrl ? (
                <div className="relative">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-48 h-28 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, thumbnailUrl: '' }))
                      if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-48 h-28 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors"
                >
                  <span className="text-gray-500 text-sm">上传封面</span>
                </div>
              )}

              <button
                onClick={() => thumbnailInputRef.current?.click()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                更换封面
              </button>
            </div>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
          </div>

          {/* Video Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">视频信息</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                  placeholder="视频标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white resize-none"
                  placeholder="视频描述（可选）"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="isPublished" className="text-gray-300">
                  公开发布
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
