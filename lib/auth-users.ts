import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserById } from '@/lib/db/users'
import crypto from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)

const USER_COOKIE_NAME = 'user_token'

export interface UserPayload {
  userId: string
  sessionId: string
}

export async function createUserSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  const jwt = await new SignJWT({ userId, sessionId: session.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return jwt
}

export async function verifyUserToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const { userId, sessionId } = payload as unknown as UserPayload

    // Verify session exists and not expired
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return { userId, sessionId }
  } catch {
    return null
  }
}

export function getUserTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get(USER_COOKIE_NAME)
  return cookie?.value || null
}

export async function getCurrentUser(request: NextRequest) {
  const token = getUserTokenFromRequest(request)
  if (!token) return null

  const payload = await verifyUserToken(token)
  if (!payload) return null

  const user = await getUserById(payload.userId)
  return user
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies()
  const token = cookieStore.get(USER_COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyUserToken(token)
  if (!payload) return null

  const user = await getUserById(payload.userId)
  return user
}

export async function deleteUserSession(sessionId: string) {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // Session might already be deleted
  })
}

export async function deleteAllUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

export { USER_COOKIE_NAME }
