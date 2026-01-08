import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
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
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPG、PNG、GIF、WebP' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '文件大小不能超过 5MB' },
        { status: 400 }
      )
    }

    ensureUploadDir()

    const fileName = generateFileName(file.name)
    const filePath = path.join(UPLOAD_DIR, fileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    fs.writeFileSync(filePath, buffer)

    const url = `/uploads/${fileName}`

    return NextResponse.json({ success: true, url })
  } catch {
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
