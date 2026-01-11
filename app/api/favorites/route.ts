import { NextRequest, NextResponse } from 'next/server'
import { getFavorites } from '@/lib/db/favorites'
import { getCurrentUser } from '@/lib/auth-users'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const favorites = await getFavorites(user.id)
    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Failed to get favorites:', error)
    return NextResponse.json({ error: '获取收藏列表失败' }, { status: 500 })
  }
}
