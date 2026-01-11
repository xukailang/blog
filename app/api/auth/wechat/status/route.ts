import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-users'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取微信绑定信息
    const wechatBind = await prisma.wechatBind.findUnique({
      where: { userId: user.id },
      select: {
        nickname: true,
        avatar: true,
        bindAt: true,
      },
    })

    // 检查用户是否有密码
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        passwordHash: true,
        email: true,
      },
    })

    return NextResponse.json({
      wechatBind,
      hasPassword: !!(fullUser?.passwordHash && fullUser?.email),
    })
  } catch (error) {
    console.error('获取微信绑定信息失败:', error)
    return NextResponse.json(
      { error: '获取信息失败' },
      { status: 500 }
    )
  }
}
