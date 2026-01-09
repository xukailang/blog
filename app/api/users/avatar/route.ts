import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'
import { updateUser } from '@/lib/db/users'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/avatars')
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

function generateFileName(originalName: string): string {
  const ext = path.extname(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `avatar-${timestamp}-${random}${ext}`
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPG、PNG、GIF、WebP' },
        { status: 400 }
      )
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '文件大小不能超过 2MB' },
        { status: 400 }
      )
    }

    // 确保上传目录存在
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    // 生成文件名并保存
    const fileName = generateFileName(file.name)
    const filePath = path.join(UPLOAD_DIR, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(filePath, buffer)

    // 删除旧头像文件（如果存在且是本地文件）
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldFilePath = path.join(process.cwd(), 'public', user.avatar)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    }

    // 更新用户头像
    const avatarUrl = `/uploads/avatars/${fileName}`
    await updateUser(user.id, { avatar: avatarUrl })

    return NextResponse.json({
      success: true,
      url: avatarUrl,
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: '上传失败，请重试' },
      { status: 500 }
    )
  }
}
