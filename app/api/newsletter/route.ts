import { NextRequest, NextResponse } from 'next/server'
import { subscribe, getSubscriberCount } from '@/lib/db/newsletter'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

export async function GET() {
  try {
    const count = await getSubscriberCount()
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Get subscriber count error:', error)
    return NextResponse.json({ error: '获取订阅数失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { success, remaining, resetTime } = rateLimit(request, 'auth')
  if (!success) {
    return createRateLimitResponse(resetTime, 'auth')
  }

  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: '请输入邮箱地址' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    const result = await subscribe(email, name)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // In production, send verification email here
    // For now, just return success
    // await sendVerificationEmail(email, result.verifyToken)

    const response = NextResponse.json({
      success: true,
      message: result.isResend
        ? '验证邮件已重新发送，请查收'
        : result.isResubscribe
        ? '重新订阅成功，请查收验证邮件'
        : '订阅成功，请查收验证邮件',
    })

    return addRateLimitHeaders(response, remaining, resetTime, 'auth')
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 })
  }
}
