import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllDrafts, saveDraft } from '@/lib/mdx'

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const drafts = getAllDrafts()
  return NextResponse.json({ drafts })
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const result = saveDraft(data.slug || '', {
      title: data.title || 'Untitled Draft',
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      tags: data.tags || [],
      category: data.category || 'uncategorized',
      coverImage: data.coverImage,
      content: data.content || '',
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: '保存草稿失败' }, { status: 500 })
  }
}
