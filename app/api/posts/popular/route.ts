import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllPosts } from '@/lib/mdx'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const period = searchParams.get('period') || 'all' // all, week, month

    // Get date filter based on period
    let dateFilter: Date | undefined
    if (period === 'week') {
      dateFilter = new Date()
      dateFilter.setDate(dateFilter.getDate() - 7)
    } else if (period === 'month') {
      dateFilter = new Date()
      dateFilter.setMonth(dateFilter.getMonth() - 1)
    }

    // Get view counts from database
    const viewCounts = await prisma.postMeta.findMany({
      select: {
        slug: true,
        viewCount: true,
      },
      orderBy: {
        viewCount: 'desc',
      },
      take: limit * 2, // Get more to filter out non-existent posts
    })

    // Get like counts
    const likeCounts = await prisma.like.groupBy({
      by: ['postSlug'],
      _count: { id: true },
      ...(dateFilter && {
        where: {
          createdAt: { gte: dateFilter },
        },
      }),
    })

    const likeMap = new Map(likeCounts.map(l => [l.postSlug, l._count.id]))

    // Get all posts metadata
    const allPosts = getAllPosts()
    const postMap = new Map(allPosts.map(p => [p.slug, p]))

    // Calculate popularity score and merge with post data
    const popularPosts = viewCounts
      .filter(vc => postMap.has(vc.slug))
      .map(vc => {
        const post = postMap.get(vc.slug)!
        const likes = likeMap.get(vc.slug) || 0
        // Popularity score: views + (likes * 10)
        const score = vc.viewCount + (likes * 10)
        return {
          ...post,
          viewCount: vc.viewCount,
          likeCount: likes,
          score,
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return NextResponse.json({
      posts: popularPosts,
      period,
    })
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular posts' },
      { status: 500 }
    )
  }
}
