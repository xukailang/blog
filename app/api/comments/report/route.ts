import { NextRequest, NextResponse } from 'next/server'
import { reportComment } from '@/lib/db/comments'
import { getCurrentUser } from '@/lib/auth-users'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'
import { ReportReason } from '@prisma/client'
import crypto from 'crypto'

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').slice(0, 16)
}

const VALID_REASONS: ReportReason[] = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'MISINFORMATION', 'OTHER']

export async function POST(request: NextRequest) {
  // 速率限制
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const { commentId, reason, detail } = await request.json()

    if (!commentId || !reason) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    if (!VALID_REASONS.includes(reason as ReportReason)) {
      return NextResponse.json({ error: '无效的举报原因' }, { status: 400 })
    }

    // 获取当前用户
    const user = await getCurrentUser(request)
    const userId = user?.id

    // 获取 IP 哈希（用于匿名用户）
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const ipHash = hashIP(ip)

    await reportComment(commentId, reason as ReportReason, detail, userId, ipHash)

    const response = NextResponse.json({
      success: true,
      message: '举报已提交，我们会尽快处理',
    })

    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Report comment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '举报失败' },
      { status: 500 }
    )
  }
}
