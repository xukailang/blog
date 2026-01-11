import { NextRequest, NextResponse } from 'next/server'
import { isFavorited, toggleFavorite } from '@/lib/db/favorites'
import { getCurrentUser } from '@/lib/auth-users'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ favorited: false })
    }

    const { slug } = await params
    const favorited = await isFavorited(user.id, slug)
    return NextResponse.json({ favorited })
  } catch (error) {
    console.error('Failed to check favorite:', error)
    return NextResponse.json({ error: '检查收藏状态失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { slug } = await params
    const result = await toggleFavorite(user.id, slug)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
