import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import { getVersionById } from '@/lib/versions/version-service'
import { savePost } from '@/lib/mdx'

interface RouteParams {
  params: Promise<{ slug: string; versionId: string }>
}

// 获取特定版本详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { versionId } = await params
    const version = await getVersionById(versionId)

    if (!version) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 })
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Get version error:', error)
    return NextResponse.json({ error: '获取版本详情失败' }, { status: 500 })
  }
}

// 恢复到特定版本
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { slug, versionId } = await params
    const version = await getVersionById(versionId)

    if (!version) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 })
    }

    if (version.postSlug !== slug) {
      return NextResponse.json({ error: '版本不属于该文章' }, { status: 400 })
    }

    // 恢复文章内容
    const result = savePost(slug, {
      title: version.title,
      date: new Date().toISOString(),
      description: version.description || '',
      tags: version.tags,
      category: version.category || 'uncategorized',
      coverImage: version.coverImage,
      content: version.content,
    })

    if (!result.success) {
      return NextResponse.json({ error: '恢复失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `已恢复到版本 ${version.version}`,
    })
  } catch (error) {
    console.error('Restore version error:', error)
    return NextResponse.json({ error: '恢复版本失败' }, { status: 500 })
  }
}
