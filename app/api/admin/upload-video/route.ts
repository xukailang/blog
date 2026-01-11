import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/videos')
const THUMBNAIL_DIR = path.join(process.cwd(), 'public/uploads/thumbnails')

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
]

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024 // 5MB

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function generateFileName(originalName: string): string {
  const ext = path.extname(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}${ext}`
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const video = formData.get('video') as File | null
    const thumbnail = formData.get('thumbnail') as File | null
    const type = formData.get('type') as string // 'video' or 'thumbnail'

    // Handle single file upload (video or thumbnail)
    if (type === 'thumbnail' && thumbnail) {
      if (!ALLOWED_IMAGE_TYPES.includes(thumbnail.type)) {
        return NextResponse.json(
          { error: '不支持的图片类型，仅支持 JPG、PNG、WebP' },
          { status: 400 }
        )
      }

      if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
        return NextResponse.json(
          { error: '缩略图大小不能超过 5MB' },
          { status: 400 }
        )
      }

      ensureDir(THUMBNAIL_DIR)
      const fileName = generateFileName(thumbnail.name)
      const filePath = path.join(THUMBNAIL_DIR, fileName)
      const bytes = await thumbnail.arrayBuffer()
      fs.writeFileSync(filePath, Buffer.from(bytes))

      return NextResponse.json({
        success: true,
        url: `/uploads/thumbnails/${fileName}`,
      })
    }

    // Handle video upload
    if (!video) {
      return NextResponse.json({ error: '请选择视频文件' }, { status: 400 })
    }

    if (!ALLOWED_VIDEO_TYPES.includes(video.type)) {
      return NextResponse.json(
        { error: '不支持的视频类型，仅支持 MP4、WebM、OGG、MOV、AVI' },
        { status: 400 }
      )
    }

    if (video.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: '视频大小不能超过 500MB' },
        { status: 400 }
      )
    }

    ensureDir(UPLOAD_DIR)

    const videoFileName = generateFileName(video.name)
    const videoPath = path.join(UPLOAD_DIR, videoFileName)
    const videoBytes = await video.arrayBuffer()
    fs.writeFileSync(videoPath, Buffer.from(videoBytes))

    const result: {
      success: boolean
      videoUrl: string
      thumbnailUrl?: string
      fileSize: number
    } = {
      success: true,
      videoUrl: `/uploads/videos/${videoFileName}`,
      fileSize: video.size,
    }

    // Handle thumbnail if provided together with video
    if (thumbnail) {
      if (ALLOWED_IMAGE_TYPES.includes(thumbnail.type) && thumbnail.size <= MAX_THUMBNAIL_SIZE) {
        ensureDir(THUMBNAIL_DIR)
        const thumbFileName = generateFileName(thumbnail.name)
        const thumbPath = path.join(THUMBNAIL_DIR, thumbFileName)
        const thumbBytes = await thumbnail.arrayBuffer()
        fs.writeFileSync(thumbPath, Buffer.from(thumbBytes))
        result.thumbnailUrl = `/uploads/thumbnails/${thumbFileName}`
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
