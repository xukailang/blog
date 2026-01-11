import { NextRequest, NextResponse } from 'next/server'
import { toggleLike, getLikeCount, hasUserLiked } from '@/lib/db/likes'
import { getCurrentUser } from '@/lib/auth-users'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const count = await getLikeCount(slug)

    // Check if current user/ip has liked
    const user = await getCurrentUser(request)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const hasLiked = await hasUserLiked(slug, user?.id, ip)

    return NextResponse.json({ likes: count, hasLiked })
  } catch (error) {
    console.error('Get likes error:', error)
    return NextResponse.json({ error: 'Failed to get likes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for interaction endpoints
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const { slug } = await request.json()

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const user = await getCurrentUser(request)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    const result = await toggleLike(slug, user?.id, ip)
    const count = await getLikeCount(slug)

    const response = NextResponse.json({ likes: count, liked: result.liked })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Toggle like error:', error)
    return NextResponse.json({ error: 'Failed to save like' }, { status: 500 })
  }
}
