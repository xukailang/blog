import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'
import { getNotifications, getUnreadCount, markAllAsRead, deleteAllNotifications } from '@/lib/db/notifications'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(user.id, { limit, offset, unreadOnly }),
      getUnreadCount(user.id),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: '获取通知失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // Mark all as read
    await markAllAsRead(user.id)

    const response = NextResponse.json({ success: true })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Mark all read error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // Delete all notifications
    await deleteAllNotifications(user.id)

    const response = NextResponse.json({ success: true })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Delete all notifications error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
