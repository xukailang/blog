import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getVlogById, updateVlog, deleteVlog } from '@/lib/db/vlogs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vlog = await getVlogById(id)

    if (!vlog) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    // If not published, require auth
    if (!vlog.isPublished) {
      if (!(await isAuthenticated(request))) {
        return NextResponse.json({ error: '视频不存在' }, { status: 404 })
      }
    }

    return NextResponse.json({ vlog })
  } catch (error) {
    console.error('Get vlog error:', error)
    return NextResponse.json({ error: '获取视频失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    const vlog = await updateVlog(id, {
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      isPublished: data.isPublished,
    })

    return NextResponse.json({ vlog })
  } catch (error) {
    console.error('Update vlog error:', error)
    return NextResponse.json({ error: '更新视频失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    await deleteVlog(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete vlog error:', error)
    return NextResponse.json({ error: '删除视频失败' }, { status: 500 })
  }
}
