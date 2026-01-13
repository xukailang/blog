import { NextRequest, NextResponse } from 'next/server'
import {
  createHighlight,
  updateHighlight,
  deleteHighlight,
  getHighlightsByPostSlug,
  getUserHighlights,
} from '@/lib/db/highlights'
import { getCurrentUser } from '@/lib/auth-users'
import { rateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit'

// 获取高亮
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

    let highlights
    if (postSlug) {
      highlights = await getHighlightsByPostSlug(user.id, postSlug)
    } else {
      highlights = await getUserHighlights(user.id)
    }

    const response = NextResponse.json({ highlights })
    return addRateLimitHeaders(response, remaining, resetTime, 'default')
  } catch (error) {
    console.error('Get highlights error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取高亮失败' },
      { status: 500 }
    )
  }
}

// 创建高亮
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

    const { postSlug, text, note, color, startOffset, endOffset, selector } = await request.json()

    if (!postSlug || !text || startOffset === undefined || endOffset === undefined) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const highlight = await createHighlight({
      userId: user.id,
      postSlug,
      text,
      note,
      color,
      startOffset,
      endOffset,
      selector,
    })

    const response = NextResponse.json({ success: true, highlight })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Create highlight error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建高亮失败' },
      { status: 500 }
    )
  }
}

// 更新高亮
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

    const { id, note, color } = await request.json()

    if (!id) {
      return NextResponse.json({ error: '缺少高亮 ID' }, { status: 400 })
    }

    const highlight = await updateHighlight(id, user.id, { note, color })

    const response = NextResponse.json({ success: true, highlight })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Update highlight error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新高亮失败' },
      { status: 500 }
    )
  }
}

// 删除高亮
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少高亮 ID' }, { status: 400 })
    }

    await deleteHighlight(id, user.id)

    const response = NextResponse.json({ success: true })
    return addRateLimitHeaders(response, remaining, resetTime, 'interaction')
  } catch (error) {
    console.error('Delete highlight error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除高亮失败' },
      { status: 500 }
    )
  }
}
