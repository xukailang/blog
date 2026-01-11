import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccessToken, getUserInfo } from '@/lib/wechat'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // 验证参数
    if (!code || !state) {
      return redirectWithError('缺少必要参数')
    }

    // 验证 state 有效性
    const loginState = await prisma.wechatLoginState.findUnique({
      where: { state },
    })

    if (!loginState) {
      return redirectWithError('无效的授权请求')
    }

    if (loginState.status !== 'pending') {
      return redirectWithError('授权请求已处理或已过期')
    }

    if (new Date() > loginState.expiresAt) {
      await prisma.wechatLoginState.update({
        where: { state },
        data: { status: 'expired' },
      })
      return redirectWithError('授权请求已过期')
    }

    // 用 code 换取 access_token
    const tokenResponse = await getAccessToken(code)

    // 获取微信用户信息
    const userInfo = await getUserInfo(tokenResponse.access_token, tokenResponse.openid)

    // 更新登录状态
    await prisma.wechatLoginState.update({
      where: { state },
      data: {
        status: 'confirmed',
        openId: tokenResponse.openid,
        unionId: tokenResponse.unionid || null,
        nickname: userInfo.nickname,
        avatar: userInfo.headimgurl,
      },
    })

    // 重定向到前端回调页面
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${appUrl}/auth/wechat/callback?state=${state}`)
  } catch (error) {
    console.error('微信回调处理失败:', error)
    return redirectWithError('授权处理失败')
  }
}

function redirectWithError(message: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return NextResponse.redirect(
    `${appUrl}/auth/wechat/callback?error=${encodeURIComponent(message)}`
  )
}
