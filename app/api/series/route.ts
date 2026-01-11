import { NextResponse } from 'next/server'
import { getAllSeries } from '@/lib/db/series'

export async function GET() {
  try {
    const series = await getAllSeries(false)
    return NextResponse.json(series)
  } catch (error) {
    console.error('Failed to get series:', error)
    return NextResponse.json({ error: '获取系列列表失败' }, { status: 500 })
  }
}
