import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getOverallStats, getRecentViews, getPostStatsForMultiple } from '@/lib/db/stats'
import { getAllPosts } from '@/lib/mdx'

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'overview') {
      const stats = await getOverallStats()
      return NextResponse.json({ stats })
    }

    if (type === 'recent') {
      const recentViews = await getRecentViews(7)
      return NextResponse.json({ recentViews })
    }

    if (type === 'posts') {
      const posts = getAllPosts()
      const slugs = posts.map((p) => p.slug)
      const postStats = await getPostStatsForMultiple(slugs)
      return NextResponse.json({ postStats })
    }

    // Default: return all stats
    const [overview, recentViews] = await Promise.all([
      getOverallStats(),
      getRecentViews(7),
    ])

    return NextResponse.json({
      overview,
      recentViews,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
