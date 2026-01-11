import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-users'

export async function POST(request: NextRequest) {
  try {
    // 验证用户已登录
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取完整用户信息（包含密码哈希）
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查用户是否有邮箱和密码（纯微信用户不能解绑）
    if (!fullUser.email || !fullUser.passwordHash) {
      return NextResponse.json(
        { error: '请先设置邮箱和密码后再解绑微信' },
        { status: 400 }
      )
    }

    // 检查是否已绑定微信
    const wechatBind = await prisma.wechatBind.findUnique({
      where: { userId: user.id },
    })

    if (!wechatBind) {
      return NextResponse.json(
        { error: '您尚未绑定微信' },
        { status: 400 }
      )
    }

    // 删除绑定
    await prisma.wechatBind.delete({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      message: '解绑成功',
    })
  } catch (error) {
    console.error('解绑微信失败:', error)
    return NextResponse.json(
      { error: '解绑失败' },
      { status: 500 }
    )
  }
}
