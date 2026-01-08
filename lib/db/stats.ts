import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

export async function recordPageView(postSlug: string, ip?: string, userAgent?: string, referer?: string) {
  // Ensure PostMeta exists
  await prisma.postMeta.upsert({
    where: { slug: postSlug },
    create: { slug: postSlug },
    update: {},
  })

  const ipHash = ip ? hashIp(ip) : null

  // Check for duplicate views in the last hour
  if (ipHash) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentView = await prisma.pageView.findFirst({
      where: {
        postSlug,
        ipHash,
        createdAt: { gte: oneHourAgo },
      },
    })

    if (recentView) {
      // Don't count duplicate view
      return null
    }
  }

  // Record new view
  const view = await prisma.pageView.create({
    data: {
      postSlug,
      ipHash,
      userAgent,
      referer,
    },
  })

  // Increment view count in PostMeta
  await prisma.postMeta.update({
    where: { slug: postSlug },
    data: { viewCount: { increment: 1 } },
  })

  return view
}

export async function getViewCount(postSlug: string) {
  const meta = await prisma.postMeta.findUnique({
    where: { slug: postSlug },
    select: { viewCount: true },
  })

  return meta?.viewCount ?? 0
}

export async function getViewCountsForPosts(slugs: string[]) {
  const metas = await prisma.postMeta.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, viewCount: true },
  })

  const result: Record<string, number> = {}
  for (const slug of slugs) {
    result[slug] = 0
  }
  for (const meta of metas) {
    result[meta.slug] = meta.viewCount
  }

  return result
}

export async function getOverallStats() {
  const [totalViews, totalLikes, totalComments, totalPosts] = await Promise.all([
    prisma.postMeta.aggregate({
      _sum: { viewCount: true },
    }),
    prisma.like.count(),
    prisma.comment.count({ where: { isApproved: true } }),
    prisma.postMeta.count(),
  ])

  return {
    totalViews: totalViews._sum.viewCount ?? 0,
    totalLikes,
    totalComments,
    totalPosts,
  }
}

export async function getPostStats(postSlug: string) {
  const [meta, likeCount, commentCount] = await Promise.all([
    prisma.postMeta.findUnique({
      where: { slug: postSlug },
      select: { viewCount: true },
    }),
    prisma.like.count({ where: { postSlug } }),
    prisma.comment.count({ where: { postSlug, isApproved: true } }),
  ])

  return {
    viewCount: meta?.viewCount ?? 0,
    likeCount,
    commentCount,
  }
}

export async function getPostStatsForMultiple(slugs: string[]) {
  const [metas, likeCounts, commentCounts] = await Promise.all([
    prisma.postMeta.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, viewCount: true },
    }),
    prisma.like.groupBy({
      by: ['postSlug'],
      where: { postSlug: { in: slugs } },
      _count: { id: true },
    }),
    prisma.comment.groupBy({
      by: ['postSlug'],
      where: { postSlug: { in: slugs }, isApproved: true },
      _count: { id: true },
    }),
  ])

  const result: Record<string, { viewCount: number; likeCount: number; commentCount: number }> = {}

  for (const slug of slugs) {
    result[slug] = { viewCount: 0, likeCount: 0, commentCount: 0 }
  }

  for (const meta of metas) {
    result[meta.slug].viewCount = meta.viewCount
  }

  for (const item of likeCounts) {
    result[item.postSlug].likeCount = item._count.id
  }

  for (const item of commentCounts) {
    result[item.postSlug].commentCount = item._count.id
  }

  return result
}

export async function getRecentViews(days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const views = await prisma.pageView.groupBy({
    by: ['postSlug'],
    where: {
      createdAt: { gte: startDate },
    },
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
    take: 10,
  })

  return views.map((v) => ({
    slug: v.postSlug,
    count: v._count.id,
  }))
}
