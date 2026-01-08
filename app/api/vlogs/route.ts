import { NextRequest, NextResponse } from 'next/server'
import { getAllVlogs } from '@/lib/db/vlogs'

export async function GET() {
  try {
    const vlogs = await getAllVlogs(false) // Only published
    return NextResponse.json({ vlogs })
  } catch (error) {
    console.error('Get vlogs error:', error)
    return NextResponse.json({ error: '获取视频列表失败' }, { status: 500 })
  }
}
