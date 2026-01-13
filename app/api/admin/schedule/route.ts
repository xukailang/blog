import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import {
  schedulePost,
  cancelScheduledPost,
  publishPost,
  unpublishPost,
  getScheduledPosts,
  getPostPublishStatus,
} from '@/lib/db/scheduled-posts'

// 获取定时发布的文章列表
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request)
  if (!isAdmin) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      // 获取单篇文章的发布状态
      const status = await getPostPublishStatus(slug)
      return NextResponse.json(status)
    }

    // 获取所有定时发布的文章
    const posts = await getScheduledPosts()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Get scheduled posts error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    )
  }
}

// 设置定时发布
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request)
  if (!isAdmin) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { slug, action, scheduledAt } = await request.json()

    if (!slug) {
      return NextResponse.json({ error: '缺少文章标识' }, { status: 400 })
    }

    switch (action) {
      case 'schedule':
        if (!scheduledAt) {
          return NextResponse.json({ error: '缺少定时发布时间' }, { status: 400 })
        }
        const scheduleDate = new Date(scheduledAt)
        if (scheduleDate <= new Date()) {
          return NextResponse.json({ error: '定时发布时间必须在未来' }, { status: 400 })
        }
        await schedulePost(slug, scheduleDate)
        return NextResponse.json({
          success: true,
          message: '已设置定时发布',
          scheduledAt: scheduleDate,
        })

      case 'cancel':
        await cancelScheduledPost(slug)
        return NextResponse.json({
          success: true,
          message: '已取消定时发布',
        })

      case 'publish':
        await publishPost(slug)
        return NextResponse.json({
          success: true,
          message: '已发布',
        })

      case 'unpublish':
        await unpublishPost(slug)
        return NextResponse.json({
          success: true,
          message: '已取消发布',
        })

      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 })
    }
  } catch (error) {
    console.error('Schedule post error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    )
  }
}
