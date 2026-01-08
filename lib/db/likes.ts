import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

export async function toggleLike(postSlug: string, userId?: string, ip?: string) {
  // Ensure PostMeta exists
  await prisma.postMeta.upsert({
    where: { slug: postSlug },
    create: { slug: postSlug },
    update: {},
  })

  const ipHash = ip ? hashIp(ip) : null

  // Check if like exists
  let existingLike = null

  if (userId) {
    existingLike = await prisma.like.findUnique({
      where: {
        postSlug_userId: { postSlug, userId },
      },
    })
  } else if (ipHash) {
    existingLike = await prisma.like.findUnique({
      where: {
        postSlug_ipHash: { postSlug, ipHash },
      },
    })
  }

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: { id: existingLike.id },
    })
    return { liked: false }
  } else {
    // Like
    await prisma.like.create({
      data: {
        postSlug,
        userId,
        ipHash,
      },
    })
    return { liked: true }
  }
}

export async function getLikeCount(postSlug: string) {
  return prisma.like.count({
    where: { postSlug },
  })
}

export async function hasUserLiked(postSlug: string, userId?: string, ip?: string) {
  const ipHash = ip ? hashIp(ip) : null

  if (userId) {
    const like = await prisma.like.findUnique({
      where: {
        postSlug_userId: { postSlug, userId },
      },
    })
    return !!like
  }

  if (ipHash) {
    const like = await prisma.like.findUnique({
      where: {
        postSlug_ipHash: { postSlug, ipHash },
      },
    })
    return !!like
  }

  return false
}

export async function getLikeCountsForPosts(slugs: string[]) {
  const counts = await prisma.like.groupBy({
    by: ['postSlug'],
    where: { postSlug: { in: slugs } },
    _count: { id: true },
  })

  const result: Record<string, number> = {}
  for (const slug of slugs) {
    result[slug] = 0
  }
  for (const item of counts) {
    result[item.postSlug] = item._count.id
  }

  return result
}
