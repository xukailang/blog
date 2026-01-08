import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllPosts, savePost } from '@/lib/mdx'

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const posts = getAllPosts()
  return NextResponse.json({ posts })
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const data = await request.json()

    if (!data.title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }

    const result = savePost('', {
      title: data.title,
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      tags: data.tags || [],
      category: data.category || 'uncategorized',
      coverImage: data.coverImage,
      content: data.content || '',
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 })
  }
}
