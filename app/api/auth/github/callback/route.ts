import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  exchangeCodeForToken,
  getGithubUser,
  findUserByGithubId,
  createUserWithGithub,
  bindGithubToUser,
} from '@/lib/db/github'
import { createUserSession, getCurrentUser, USER_COOKIE_NAME } from '@/lib/auth-users'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('GitHub OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=github_denied', request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/login?error=invalid_request', request.url))
    }

    // Verify state
    const cookieStore = await cookies()
    const storedState = cookieStore.get('github_oauth_state')?.value
    const action = cookieStore.get('github_oauth_action')?.value || 'login'

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
    }

    // Clear OAuth cookies
    cookieStore.delete('github_oauth_state')
    cookieStore.delete('github_oauth_action')

    // Exchange code for token
    const accessToken = await exchangeCodeForToken(code)

    // Get GitHub user info
    const githubUser = await getGithubUser(accessToken)

    let redirectUrl = '/'

    if (action === 'bind') {
      // Bind to existing user
      const currentUser = await getCurrentUser(request)
      if (!currentUser) {
        return NextResponse.redirect(new URL('/login?error=not_logged_in', request.url))
      }

      try {
        await bindGithubToUser(currentUser.id, githubUser)
        redirectUrl = '/settings?tab=accounts&success=github_bound'
      } catch (err) {
        const message = err instanceof Error ? err.message : 'bind_failed'
        redirectUrl = `/settings?tab=accounts&error=${encodeURIComponent(message)}`
      }
    } else {
      // Login or register
      let user = await findUserByGithubId(githubUser.id)

      if (!user) {
        // Create new user
        user = await createUserWithGithub(githubUser)
      }

      // Create session
      const token = await createUserSession(user.id)

      const response = NextResponse.redirect(new URL(redirectUrl, request.url))
      response.cookies.set(USER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error('GitHub callback error:', error)
    return NextResponse.redirect(new URL('/login?error=github_callback_failed', request.url))
  }
}
