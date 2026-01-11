import { NextRequest, NextResponse } from 'next/server'
import { getAllSeries, createSeries } from '@/lib/db/series'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const series = await getAllSeries(true)
    return NextResponse.json(series)
  } catch (error) {
    console.error('Failed to get series:', error)
    return NextResponse.json({ error: '获取系列列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const data = await request.json()

    if (!data.name) {
      return NextResponse.json({ error: '系列名称不能为空' }, { status: 400 })
    }

    const series = await createSeries({
      name: data.name,
      description: data.description,
      coverImage: data.coverImage,
      color: data.color,
      isPublished: data.isPublished,
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error('Failed to create series:', error)
    return NextResponse.json({ error: '创建系列失败' }, { status: 500 })
  }
}
