import { NextRequest, NextResponse } from 'next/server'
import { generateOAuthState, getGithubAuthUrl } from '@/lib/db/github'
import { getCurrentUser } from '@/lib/auth-users'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'login' // login or bind

    // Generate state
    const state = generateOAuthState()

    // Store state in cookie for verification
    const cookieStore = await cookies()
    cookieStore.set('github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    // Store action in cookie
    cookieStore.set('github_oauth_action', action, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    })

    // If binding, verify user is logged in
    if (action === 'bind') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: '请先登录' }, { status: 401 })
      }
    }

    // Get redirect URI
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const redirectUri = `${baseUrl}/api/auth/github/callback`

    // Generate auth URL
    const authUrl = getGithubAuthUrl(state, redirectUri)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('GitHub auth error:', error)
    return NextResponse.redirect(new URL('/login?error=github_auth_failed', request.url))
  }
}
