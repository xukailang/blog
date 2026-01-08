import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated(request)
  return NextResponse.json({ authenticated })
}
