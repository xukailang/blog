import { NextRequest, NextResponse } from 'next/server'
import { toggleCommentReaction, EMOJI_TYPES, EmojiType } from '@/lib/db/comments'
import { getCurrentUser } from '@/lib/auth-users'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'
import crypto from 'crypto'

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').slice(0, 16)
}

export async function POST(request: NextRequest) {
  // 速率限制
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const { commentId, emoji } = await request.json()

    if (!commentId || !emoji) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    if (!EMOJI_TYPES.includes(emoji as EmojiType)) {
      return NextResponse.json({ error: '无效的表情类型' }, { status: 400 })
    }

    // 获取当前用户
    const user = await getCurrentUser(request)
    const userId = user?.id

    // 获取 IP 哈希（用于匿名用户）
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const ipHash = hashIP(ip)

    const result = await toggleCommentReaction(commentId, emoji as EmojiType, userId, ipHash)

    const response = NextResponse.json({
      success: true,
      action: result.action,
    })

    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Toggle reaction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    )
  }
}
