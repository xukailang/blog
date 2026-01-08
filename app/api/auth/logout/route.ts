import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken, deleteUserSession, USER_COOKIE_NAME, getUserTokenFromRequest } from '@/lib/auth-users'

export async function POST(request: NextRequest) {
  try {
    const token = getUserTokenFromRequest(request)

    if (token) {
      const payload = await verifyUserToken(token)
      if (payload) {
        await deleteUserSession(payload.sessionId)
      }
    }

    const response = NextResponse.json({ success: true })

    response.cookies.delete(USER_COOKIE_NAME)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookie even if there's an error
    const response = NextResponse.json({ success: true })
    response.cookies.delete(USER_COOKIE_NAME)
    return response
  }
}
