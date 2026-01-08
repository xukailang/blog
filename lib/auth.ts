import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)

const COOKIE_NAME = 'admin_token'

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get(COOKIE_NAME)
  return cookie?.value || null
}

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = getTokenFromRequest(request)
  if (!token) return false

  const payload = await verifyToken(token)
  return payload !== null
}

export async function getAuthFromCookies(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false

  const payload = await verifyToken(token)
  return payload !== null
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in environment variables')
    return false
  }
  return password === adminPassword
}

export { COOKIE_NAME }
