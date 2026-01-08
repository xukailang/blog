import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { publishDraft } from '@/lib/mdx'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const result = publishDraft(slug)

  if (!result.success) {
    return NextResponse.json({ error: '草稿不存在' }, { status: 404 })
  }

  return NextResponse.json(result)
}
