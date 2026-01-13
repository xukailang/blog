import { NextRequest, NextResponse } from 'next/server'
import {
  upsertBookmark,
  deleteBookmark,
  getBookmarkByPostSlug,
  getUserBookmarks,
  hasBookmark,
} from '@/lib/db/highlights'
import { getCurrentUser } from '@/lib/auth-users'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

// 获取书签
export async function GET(request: NextRequest) {
  const { success, remaining, resetTime } = rateLimit(request, 'default')
  if (!success) {
    return createRateLimitResponse(resetTime, 'default')
  }

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')

    if (postSlug) {
      const bookmark = await getBookmarkByPostSlug(user.id, postSlug)
      const response = NextResponse.json({ bookmark, hasBookmark: !!bookmark })
      return addRateLimitHeaders(response, remaining, resetTime, 'default')
    }

    const bookmarks = await getUserBookmarks(user.id)
    const response = NextResponse.json({ bookmarks })
    return addRateLimitHeaders(response, remaining, resetTime, 'default')
  } catch (error) {
    console.error('Get bookmarks error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取书签失败' },
      { status: 500 }
    )
  }
}

// 创建或更新书签
export async function POST(request: NextRequest) {
  const { success, remaining, resetTime } = rateLimit(request, 'interaction')
  if (!success) {
    return createRateLimitResponse(resetTime, 'interaction')
  }

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { postSlug, title, note, position, selector } = await request.json()

    if (!postSlug) {
      return NextResponse.json({ error: '缺少文章标识' }, { status: 400 })
    }

    const bookmark = await upsertBookmark({
      userId: user.id,
      postSlug,
      title,
      note,
      position,
      selector,
    })

    const response = NextResponse.json({ success: true, bookmark })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Create bookmark error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建书签失败' },
      { status: 500 }
    )
  }
}

// 删除书签
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

    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')

    if (!postSlug) {
      return NextResponse.json({ error: '缺少文章标识' }, { status: 400 })
    }

    await deleteBookmark(user.id, postSlug)

    const response = NextResponse.json({ success: true })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Delete bookmark error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除书签失败' },
      { status: 500 }
    )
  }
}
