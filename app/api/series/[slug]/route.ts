import { NextRequest, NextResponse } from 'next/server'
import { getSeriesBySlug } from '@/lib/db/series'
import { getPostBySlug } from '@/lib/mdx'

interface SeriesPost {
  id: string
  seriesId: string
  postSlug: string
  order: number
  createdAt: Date
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const series = await getSeriesBySlug(slug)

    if (!series) {
      return NextResponse.json({ error: '系列不存在' }, { status: 404 })
    }

    // 获取每篇文章的详细信息
    const postsWithDetails = await Promise.all(
      series.posts.map(async (sp: SeriesPost) => {
        const post = getPostBySlug(sp.postSlug)
        return {
          ...sp,
          post: post || null,
        }
      })
    )

    return NextResponse.json({
      ...series,
      posts: postsWithDetails,
    })
  } catch (error) {
    console.error('Failed to get series:', error)
    return NextResponse.json({ error: '获取系列详情失败' }, { status: 500 })
  }
}
