import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllCategories, createCategory } from '@/lib/db/categories'

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const categories = await getAllCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { name, description, color } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 })
    }

    const category = await createCategory({
      name: name.trim(),
      description,
      color,
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Create category error:', error)
    if ((error as Error).message?.includes('Unique constraint')) {
      return NextResponse.json({ error: '分类名称已存在' }, { status: 400 })
    }
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 })
  }
}
