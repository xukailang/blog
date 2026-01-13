import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'
import { savePushSubscription, deletePushSubscription, getVapidPublicKey } from '@/lib/push/web-push'

// 获取 VAPID 公钥
export async function GET() {
  const publicKey = getVapidPublicKey()

  if (!publicKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 503 }
    )
  }

  return NextResponse.json({ publicKey })
}

// 订阅推送
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: '无效的订阅数据' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') || undefined

    await savePushSubscription(user.id, subscription, userAgent)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscribe push error:', error)
    return NextResponse.json({ error: '订阅失败' }, { status: 500 })
  }
}

// 取消订阅
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: '无效的端点' }, { status: 400 })
    }

    await deletePushSubscription(endpoint)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe push error:', error)
    return NextResponse.json({ error: '取消订阅失败' }, { status: 500 })
  }
}
