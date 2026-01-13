import { NextRequest, NextResponse } from 'next/server'
import { publishScheduledPosts } from '@/lib/db/scheduled-posts'

/**
 * 定时发布 Cron Job
 *
 * 配置 Vercel Cron:
 * 在 vercel.json 中添加:
 * {
 *   "crons": [{
 *     "path": "/api/cron/publish",
 *     "schedule": "* * * * *"
 *   }]
 * }
 *
 * 或者使用外部 Cron 服务定期调用此 API
 */

// Cron 密钥验证（可选，用于安全）
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // 验证 Cron 密钥（如果配置了）
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const result = await publishScheduledPosts()

    return NextResponse.json({
      success: true,
      message: `Published ${result.published} posts`,
      ...result,
    })
  } catch (error) {
    console.error('Cron publish error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish scheduled posts' },
      { status: 500 }
    )
  }
}

// 也支持 POST 请求
export async function POST(request: NextRequest) {
  return GET(request)
}
