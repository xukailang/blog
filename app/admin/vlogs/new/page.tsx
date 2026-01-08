'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewVlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    fileSize: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const res = await fetch('/api/admin/auth/check')
    const data = await res.json()
    if (!data.authenticated) {
      router.push('/admin/login')
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      alert('视频大小不能超过 500MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const formDataUpload = new FormData()
    formDataUpload.append('video', file)

    try {
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText)
          setFormData((prev) => ({
            ...prev,
            videoUrl: result.videoUrl,
            fileSize: result.fileSize,
          }))

          // Try to get video duration
          const video = document.createElement('video')
          video.preload = 'metadata'
          video.onloadedmetadata = () => {
            setFormData((prev) => ({
              ...prev,
              duration: Math.round(video.duration),
            }))
          }
          video.src = result.videoUrl
        } else {
          const result = JSON.parse(xhr.responseText)
          alert(result.error || '上传失败')
        }
        setUploading(false)
      })

      xhr.addEventListener('error', () => {
        alert('上传失败')
        setUploading(false)
      })

      xhr.open('POST', '/api/admin/upload-video')
      xhr.send(formDataUpload)
    } catch {
      alert('上传失败')
      setUploading(false)
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

  const handleSubmit = async (isPublished: boolean) => {
    if (!formData.title) {
      alert('请输入标题')
      return
    }

    if (!formData.videoUrl) {
      alert('请上传视频')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/vlogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPublished,
        }),
      })

      if (res.ok) {
        router.push('/admin/vlogs')
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } catch {
      alert('保存失败')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-lg font-medium text-white">上传 Vlog</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || uploading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              保存草稿
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading || uploading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Video Upload */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">视频文件</h2>

            {formData.videoUrl ? (
              <div className="space-y-4">
                <video
                  src={formData.videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    时长: {Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')} |
                    大小: {(formData.fileSize / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, videoUrl: '', duration: 0, fileSize: 0 }))
                      if (videoInputRef.current) videoInputRef.current.value = ''
                    }}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    重新上传
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-cyan-500 transition-colors ${
                  uploading ? 'pointer-events-none' : ''
                }`}
              >
                {uploading ? (
                  <div className="space-y-4">
                    <div className="text-cyan-400">上传中... {uploadProgress}%</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-16 h-16 mx-auto text-gray-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-400 mb-2">点击或拖拽上传视频</p>
                    <p className="text-gray-500 text-sm">
                      支持 MP4、WebM、MOV、AVI，最大 500MB
                    </p>
                  </>
                )}
              </div>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">封面图片（可选）</h2>

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

              <p className="text-gray-500 text-sm">
                建议尺寸 16:9，支持 JPG、PNG、WebP
              </p>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
