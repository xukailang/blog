import { prisma } from '@/lib/prisma'

export async function getFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function isFavorited(userId: string, postSlug: string) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
  })
  return !!favorite
}

export async function addFavorite(userId: string, postSlug: string) {
  return prisma.favorite.create({
    data: {
      userId,
      postSlug,
    },
  })
}

export async function removeFavorite(userId: string, postSlug: string) {
  return prisma.favorite.delete({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
  })
}

export async function toggleFavorite(userId: string, postSlug: string) {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
  })

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    })
    return { favorited: false }
  } else {
    await prisma.favorite.create({
      data: {
        userId,
        postSlug,
      },
    })
    return { favorited: true }
  }
}

export async function getFavoriteCount(userId: string) {
  return prisma.favorite.count({
    where: { userId },
  })
}
