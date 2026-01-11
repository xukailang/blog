import { NextRequest, NextResponse } from 'next/server'
import { getSeriesById, updateSeries, deleteSeries } from '@/lib/db/series'
import { isAuthenticated } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    const series = await getSeriesById(id)

    if (!series) {
      return NextResponse.json({ error: '系列不存在' }, { status: 404 })
    }

    return NextResponse.json(series)
  } catch (error) {
    console.error('Failed to get series:', error)
    return NextResponse.json({ error: '获取系列详情失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    const series = await updateSeries(id, {
      name: data.name,
      description: data.description,
      coverImage: data.coverImage,
      color: data.color,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error('Failed to update series:', error)
    return NextResponse.json({ error: '更新系列失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    await deleteSeries(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete series:', error)
    return NextResponse.json({ error: '删除系列失败' }, { status: 500 })
  }
}
