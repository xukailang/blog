import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllVlogs, createVlog } from '@/lib/db/vlogs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeUnpublished = searchParams.get('all') === 'true'

  // If requesting unpublished, require auth
  if (includeUnpublished) {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
  }

  try {
    const vlogs = await getAllVlogs(includeUnpublished)
    return NextResponse.json({ vlogs })
  } catch (error) {
    console.error('Get vlogs error:', error)
    return NextResponse.json({ error: '获取视频列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const data = await request.json()

    if (!data.title || !data.videoUrl) {
      return NextResponse.json(
        { error: '标题和视频地址不能为空' },
        { status: 400 }
      )
    }

    const vlog = await createVlog({
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      fileSize: data.fileSize,
      isPublished: data.isPublished || false,
    })

    return NextResponse.json({ vlog })
  } catch (error) {
    console.error('Create vlog error:', error)
    return NextResponse.json({ error: '创建视频失败' }, { status: 500 })
  }
}
