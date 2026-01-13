import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

// 获取自动保存的草稿
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const draft = await prisma.autoSaveDraft.findFirst({
      where: {
        userId: admin.id,
        postSlug: slug || null,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: '未找到草稿' }, { status: 404 })
    }

    return NextResponse.json({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      metadata: draft.metadata,
      lastSavedAt: draft.lastSavedAt,
    })
  } catch (error) {
    console.error('Get auto-save draft error:', error)
    return NextResponse.json({ error: '获取草稿失败' }, { status: 500 })
  }
}

// 保存草稿
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { postSlug, title, content, metadata } = body

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    // 使用 upsert 创建或更新草稿
    const draft = await prisma.autoSaveDraft.upsert({
      where: {
        userId_postSlug: {
          userId: admin.id,
          postSlug: postSlug || null,
        },
      },
      update: {
        title,
        content,
        metadata,
        lastSavedAt: new Date(),
      },
      create: {
        userId: admin.id,
        postSlug: postSlug || null,
        title,
        content,
        metadata,
      },
    })

    return NextResponse.json({
      id: draft.id,
      lastSavedAt: draft.lastSavedAt,
    })
  } catch (error) {
    console.error('Save auto-save draft error:', error)
    return NextResponse.json({ error: '保存草稿失败' }, { status: 500 })
  }
}

// 删除草稿
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    await prisma.autoSaveDraft.deleteMany({
      where: {
        userId: admin.id,
        postSlug: slug || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete auto-save draft error:', error)
    return NextResponse.json({ error: '删除草稿失败' }, { status: 500 })
  }
}
