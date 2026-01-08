import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllComments, getPendingComments } from '@/lib/db/comments'

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const pending = searchParams.get('pending') === 'true'

    const comments = pending
      ? await getPendingComments()
      : await getAllComments()

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 })
  }
}
