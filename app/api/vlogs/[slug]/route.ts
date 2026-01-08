import { NextRequest, NextResponse } from 'next/server'
import { getVlogBySlug, incrementVlogViewCount } from '@/lib/db/vlogs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const vlog = await getVlogBySlug(slug)

    if (!vlog || !vlog.isPublished) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    // Increment view count
    await incrementVlogViewCount(vlog.id)

    return NextResponse.json({ vlog })
  } catch (error) {
    console.error('Get vlog error:', error)
    return NextResponse.json({ error: '获取视频失败' }, { status: 500 })
  }
}
