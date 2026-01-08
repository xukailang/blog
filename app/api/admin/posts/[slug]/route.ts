import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getPostBySlug, updatePost, deletePost } from '@/lib/mdx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  return NextResponse.json({ post })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const data = await request.json()

    if (!data.title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }

    const result = updatePost(slug, {
      title: data.title,
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      tags: data.tags || [],
      category: data.category || 'uncategorized',
      coverImage: data.coverImage,
      content: data.content || '',
    })

    if (!result.success) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const success = deletePost(slug)

  if (!success) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
