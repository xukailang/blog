import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'
import { updateUser } from '@/lib/db/users'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { name, avatar } = await request.json()

    await updateUser(user.id, {
      name: name || undefined,
      avatar: avatar || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
