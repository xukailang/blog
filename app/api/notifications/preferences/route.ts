import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'
import { getNotificationPreference, updateNotificationPreference } from '@/lib/push/notification-preference'

// 获取通知偏好
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const preference = await getNotificationPreference(user.id)

    return NextResponse.json({ preference })
  } catch (error) {
    console.error('Get notification preference error:', error)
    return NextResponse.json({ error: '获取偏好失败' }, { status: 500 })
  }
}

// 更新通知偏好
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const {
      emailEnabled,
      pushEnabled,
      commentReply,
      postLike,
      mention,
      system,
      emailDigest,
      quietHoursStart,
      quietHoursEnd,
    } = body

    const preference = await updateNotificationPreference(user.id, {
      emailEnabled,
      pushEnabled,
      commentReply,
      postLike,
      mention,
      system,
      emailDigest,
      quietHoursStart,
      quietHoursEnd,
    })

    return NextResponse.json({ preference })
  } catch (error) {
    console.error('Update notification preference error:', error)
    return NextResponse.json({ error: '更新偏好失败' }, { status: 500 })
  }
}
