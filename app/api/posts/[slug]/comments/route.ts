import { NextRequest, NextResponse } from 'next/server'
import { getCommentsByPostSlug, createComment } from '@/lib/db/comments'
import { getCurrentUser } from '@/lib/auth-users'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const comments = await getCommentsByPostSlug(slug)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Apply rate limiting for interaction endpoints
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const { slug } = await params
    const { content, guestName, guestEmail, parentId } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
    }

    // Check if user is logged in
    const user = await getCurrentUser(request)

    // If not logged in, require guest info
    if (!user && (!guestName || !guestName.trim())) {
      return NextResponse.json({ error: '请输入昵称' }, { status: 400 })
    }

    const comment = await createComment({
      content: content.trim(),
      postSlug: slug,
      userId: user?.id,
      guestName: user ? undefined : guestName?.trim(),
      guestEmail: user ? undefined : guestEmail?.trim(),
      parentId,
    })

    const response = NextResponse.json({ comment })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: '发表评论失败' }, { status: 500 })
  }
}
