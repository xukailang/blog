import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDraftBySlug, deleteDraft } from '@/lib/mdx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const draft = getDraftBySlug(slug)

  if (!draft) {
    return NextResponse.json({ error: '草稿不存在' }, { status: 404 })
  }

  return NextResponse.json({ draft })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const success = deleteDraft(slug)

  if (!success) {
    return NextResponse.json({ error: '草稿不存在' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
