import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ user: null })
  }
}
