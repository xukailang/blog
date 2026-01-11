import { NextRequest, NextResponse } from 'next/server'
import { verifySubscription } from '@/lib/db/newsletter'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/newsletter/error?reason=missing_token', request.url))
  }

  const result = await verifySubscription(token)

  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/newsletter/error?reason=${encodeURIComponent(result.error || 'unknown')}`, request.url)
    )
  }

  return NextResponse.redirect(new URL('/newsletter/verified', request.url))
}
