import { NextRequest, NextResponse } from 'next/server'
import { recordPageView, getViewCount } from '@/lib/db/stats'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const count = await getViewCount(slug)
    return NextResponse.json({ views: count })
  } catch (error) {
    console.error('Get views error:', error)
    return NextResponse.json({ error: 'Failed to get views' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || undefined

    await recordPageView(slug, ip, userAgent, referer)
    const count = await getViewCount(slug)

    return NextResponse.json({ views: count })
  } catch (error) {
    console.error('Record view error:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}
