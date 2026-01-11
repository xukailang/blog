import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'
import { markAsRead, deleteNotification } from '@/lib/db/notifications'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { id } = await params
    await markAsRead(id, user.id)

    const response = NextResponse.json({ success: true })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { id } = await params
    await deleteNotification(id, user.id)

    const response = NextResponse.json({ success: true })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
