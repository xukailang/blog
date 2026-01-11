import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSession, getCurrentUser, USER_COOKIE_NAME } from '@/lib/auth-users'
import type { PollResponse } from '@/lib/wechat'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')

    if (!state) {
      return NextResponse.json(
        { status: 'error', message: '缺少 state 参数' } as PollResponse,
        { status: 400 }
      )
    }

    // 查询登录状态
    const loginState = await prisma.wechatLoginState.findUnique({
      where: { state },
    })

    if (!loginState) {
      return NextResponse.json(
        { status: 'error', message: '无效的登录请求' } as PollResponse,
        { status: 404 }
      )
    }

    // 检查是否过期
    if (new Date() > loginState.expiresAt) {
      if (loginState.status === 'pending') {
        await prisma.wechatLoginState.update({
          where: { state },
          data: { status: 'expired' },
        })
      }
      return NextResponse.json({ status: 'expired' } as PollResponse)
    }

    // 返回当前状态
    if (loginState.status === 'pending') {
      return NextResponse.json({ status: 'pending' } as PollResponse)
    }

    if (loginState.status === 'scanned') {
      return NextResponse.json({ status: 'scanned' } as PollResponse)
    }

    if (loginState.status === 'confirmed' && loginState.openId) {
      // 检查是否已绑定用户
      const wechatBind = await prisma.wechatBind.findUnique({
        where: { openId: loginState.openId },
        include: { user: true },
      })

      if (loginState.scene === 'bind') {
        // 绑定场景：检查当前登录用户
        const currentUser = await getCurrentUser(request)
        if (!currentUser) {
          return NextResponse.json(
            { status: 'error', message: '请先登录' } as PollResponse,
            { status: 401 }
          )
        }

        if (wechatBind) {
          return NextResponse.json(
            { status: 'error', message: '该微信已绑定其他账号' } as PollResponse,
            { status: 400 }
          )
        }

        // 创建绑定
        await prisma.wechatBind.create({
          data: {
            userId: currentUser.id,
            openId: loginState.openId,
            unionId: loginState.unionId,
            nickname: loginState.nickname,
            avatar: loginState.avatar,
          },
        })

        // 清理登录状态
        await prisma.wechatLoginState.delete({
          where: { state },
        })

        return NextResponse.json({
          status: 'confirmed',
          message: '绑定成功',
          wechatInfo: {
            nickname: loginState.nickname || '',
            avatar: loginState.avatar || '',
            openId: loginState.openId,
          },
        } as PollResponse)
      }

      // 登录场景
      if (wechatBind) {
        // 已绑定用户，直接登录
        const token = await createUserSession(wechatBind.userId)

        // 清理登录状态
        await prisma.wechatLoginState.delete({
          where: { state },
        })

        const response = NextResponse.json({
          status: 'confirmed',
          token,
          wechatInfo: {
            nickname: loginState.nickname || '',
            avatar: loginState.avatar || '',
            openId: loginState.openId,
          },
        } as PollResponse)

        // 设置 cookie
        response.cookies.set(USER_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
        })

        return response
      } else {
        // 未绑定用户，需要绑定或创建新账号
        return NextResponse.json({
          status: 'confirmed',
          needBind: true,
          wechatInfo: {
            nickname: loginState.nickname || '',
            avatar: loginState.avatar || '',
            openId: loginState.openId,
          },
        } as PollResponse)
      }
    }

    return NextResponse.json({ status: loginState.status } as PollResponse)
  } catch (error) {
    console.error('轮询状态失败:', error)
    return NextResponse.json(
      { status: 'error', message: '查询状态失败' } as PollResponse,
      { status: 500 }
    )
  }
}
