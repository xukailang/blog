import { NextRequest, NextResponse } from 'next/server'
import { getReadingHistory, recordReading, clearReadingHistory } from '@/lib/db/reading-history'
import { getCurrentUser } from '@/lib/auth-users'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const history = await getReadingHistory(user.id, limit, offset)
    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to get reading history:', error)
    return NextResponse.json({ error: '获取阅读历史失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const data = await request.json()
    if (!data.postSlug) {
      return NextResponse.json({ error: '文章 slug 不能为空' }, { status: 400 })
    }

    const history = await recordReading(user.id, data.postSlug, data.progress, data.duration)
    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to record reading:', error)
    return NextResponse.json({ error: '记录阅读历史失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    await clearReadingHistory(user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear reading history:', error)
    return NextResponse.json({ error: '清空阅读历史失败' }, { status: 500 })
  }
}
