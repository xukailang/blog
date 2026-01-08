import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { approveComment, deleteComment, getCommentById } from '@/lib/db/comments'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    const comment = await getCommentById(id)

    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Get comment error:', error)
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { action } = await request.json()

    if (action === 'approve') {
      const comment = await approveComment(id)
      return NextResponse.json({ comment })
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    await deleteComment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
