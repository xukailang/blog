import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { updateCategory, deleteCategory, getCategoryById } from '@/lib/db/categories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await params
    const category = await getCategoryById(id)

    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
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
    const { name, description, color } = await request.json()

    const category = await updateCategory(id, {
      name,
      description,
      color,
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Update category error:', error)
    if ((error as Error).message?.includes('Unique constraint')) {
      return NextResponse.json({ error: '分类名称已存在' }, { status: 400 })
    }
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 })
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
    await deleteCategory(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 })
  }
}
