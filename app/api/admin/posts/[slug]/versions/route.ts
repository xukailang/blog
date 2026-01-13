import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import { getVersions, createVersion } from '@/lib/versions/version-service'
import { getPostBySlug } from '@/lib/mdx'

interface RouteParams {
  params: Promise<{ slug: string }>
}

// 获取文章的所有版本
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { slug } = await params
    const versions = await getVersions(slug)

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Get versions error:', error)
    return NextResponse.json({ error: '获取版本列表失败' }, { status: 500 })
  }
}

// 手动创建版本快照
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { changeNote } = body

    // 获取当前文章内容
    const post = getPostBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // 创建版本
    const version = await createVersion({
      postSlug: slug,
      title: post.title,
      content: post.content,
      description: post.description,
      tags: post.tags,
      category: post.category,
      coverImage: post.coverImage,
      changeNote: changeNote || '手动创建快照',
      createdBy: admin.id,
    })

    return NextResponse.json({
      id: version.id,
      version: version.version,
      createdAt: version.createdAt,
    })
  } catch (error) {
    console.error('Create version error:', error)
    return NextResponse.json({ error: '创建版本失败' }, { status: 500 })
  }
}
