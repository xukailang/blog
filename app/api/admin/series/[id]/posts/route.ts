import { NextRequest, NextResponse } from 'next/server'
import { addPostToSeries, removePostFromSeries, updateSeriesPostOrder } from '@/lib/db/series'
import { isAuthenticated } from '@/lib/auth'

export async function POST(
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

    if (!data.postSlug) {
      return NextResponse.json({ error: '文章 slug 不能为空' }, { status: 400 })
    }

    const seriesPost = await addPostToSeries(id, data.postSlug, data.order)
    return NextResponse.json(seriesPost)
  } catch (error) {
    console.error('Failed to add post to series:', error)
    return NextResponse.json({ error: '添加文章到系列失败' }, { status: 500 })
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
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')

    if (!postSlug) {
      return NextResponse.json({ error: '文章 slug 不能为空' }, { status: 400 })
    }

    await removePostFromSeries(id, postSlug)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove post from series:', error)
    return NextResponse.json({ error: '从系列移除文章失败' }, { status: 500 })
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

    if (!Array.isArray(data.posts)) {
      return NextResponse.json({ error: '无效的文章列表' }, { status: 400 })
    }

    await updateSeriesPostOrder(id, data.posts)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update series post order:', error)
    return NextResponse.json({ error: '更新文章顺序失败' }, { status: 500 })
  }
}
