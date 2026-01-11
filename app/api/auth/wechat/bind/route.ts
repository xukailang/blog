import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSession, USER_COOKIE_NAME } from '@/lib/auth-users'
import { verifyUserPassword } from '@/lib/db/users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { state, email, password, createNew } = body

    if (!state) {
      return NextResponse.json(
        { error: '缺少 state 参数' },
        { status: 400 }
      )
    }

    // 查询登录状态
    const loginState = await prisma.wechatLoginState.findUnique({
      where: { state },
    })

    if (!loginState || loginState.status !== 'confirmed' || !loginState.openId) {
      return NextResponse.json(
        { error: '无效的登录请求' },
        { status: 400 }
      )
    }

    // 检查微信是否已绑定
    const existingBind = await prisma.wechatBind.findUnique({
      where: { openId: loginState.openId },
    })

    if (existingBind) {
      return NextResponse.json(
        { error: '该微信已绑定其他账号' },
        { status: 400 }
      )
    }

    let userId: string

    if (createNew) {
      // 创建新用户（纯微信用户）
      const newUser = await prisma.user.create({
        data: {
          name: loginState.nickname,
          avatar: loginState.avatar,
        },
      })
      userId = newUser.id
    } else {
      // 绑定已有账号
      if (!email || !password) {
        return NextResponse.json(
          { error: '请输入邮箱和密码' },
          { status: 400 }
        )
      }

      // 验证邮箱密码
      const user = await verifyUserPassword(email, password)
      if (!user) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        )
      }

      // 检查该账号是否已绑定其他微信
      const userBind = await prisma.wechatBind.findUnique({
        where: { userId: user.id },
      })

      if (userBind) {
        return NextResponse.json(
          { error: '该账号已绑定其他微信' },
          { status: 400 }
        )
      }

      userId = user.id
    }

    // 创建绑定
    await prisma.wechatBind.create({
      data: {
        userId,
        openId: loginState.openId,
        unionId: loginState.unionId,
        nickname: loginState.nickname,
        avatar: loginState.avatar,
      },
    })

    // 创建会话
    const token = await createUserSession(userId)

    // 清理登录状态
    await prisma.wechatLoginState.delete({
      where: { state },
    })

    const response = NextResponse.json({
      success: true,
      message: createNew ? '账号创建成功' : '绑定成功',
    })

    // 设置 cookie
    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('绑定账号失败:', error)
    return NextResponse.json(
      { error: '绑定失败' },
      { status: 500 }
    )
  }
}
