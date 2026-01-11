import { NextRequest, NextResponse } from 'next/server'
import { deleteReadingHistory, getReadingProgress, updateReadingProgress } from '@/lib/db/reading-history'
import { getCurrentUser } from '@/lib/auth-users'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ progress: 0 })
    }

    const { slug } = await params
    const progress = await getReadingProgress(user.id, slug)
    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Failed to get reading progress:', error)
    return NextResponse.json({ error: '获取阅读进度失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { slug } = await params
    const data = await request.json()

    const history = await updateReadingProgress(user.id, slug, data.progress, data.duration)
    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to update reading progress:', error)
    return NextResponse.json({ error: '更新阅读进度失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { slug } = await params
    await deleteReadingHistory(user.id, slug)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete reading history:', error)
    return NextResponse.json({ error: '删除阅读历史失败' }, { status: 500 })
  }
}
