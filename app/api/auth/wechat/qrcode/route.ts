import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateState, generateAuthUrl, wechatConfig } from '@/lib/wechat'
import { getCurrentUser } from '@/lib/auth-users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const scene = body.scene || 'login'

    // 如果是绑定场景，需要验证用户已登录
    if (scene === 'bind') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json(
          { error: '请先登录' },
          { status: 401 }
        )
      }

      // 检查是否已绑定
      const existingBind = await prisma.wechatBind.findUnique({
        where: { userId: user.id },
      })

      if (existingBind) {
        return NextResponse.json(
          { error: '您已绑定微信账号' },
          { status: 400 }
        )
      }
    }

    // 生成唯一 state
    const state = generateState()
    const expiresAt = new Date(Date.now() + wechatConfig.stateExpireSeconds * 1000)

    // 存储 state 到数据库
    await prisma.wechatLoginState.create({
      data: {
        state,
        scene,
        expiresAt,
        status: 'pending',
      },
    })

    // 生成回调 URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUri = `${appUrl}/api/auth/wechat/callback`

    // 生成二维码 URL
    const qrcodeUrl = generateAuthUrl(state, redirectUri)

    return NextResponse.json({
      state,
      qrcodeUrl,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('生成微信二维码失败:', error)
    return NextResponse.json(
      { error: '生成二维码失败' },
      { status: 500 }
    )
  }
}
