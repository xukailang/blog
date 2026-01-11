import { prisma } from '@/lib/prisma'

export async function getReadingHistory(userId: string, limit = 20, offset = 0) {
  return prisma.readingHistory.findMany({
    where: { userId },
    orderBy: { readAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function getReadingHistoryCount(userId: string) {
  return prisma.readingHistory.count({
    where: { userId },
  })
}

export async function recordReading(
  userId: string,
  postSlug: string,
  progress?: number,
  duration?: number
) {
  return prisma.readingHistory.upsert({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
    create: {
      userId,
      postSlug,
      progress: progress ?? 0,
      duration: duration ?? 0,
    },
    update: {
      readAt: new Date(),
      progress: progress ?? undefined,
      duration: duration ?? undefined,
    },
  })
}

export async function updateReadingProgress(
  userId: string,
  postSlug: string,
  progress: number,
  duration?: number
) {
  return prisma.readingHistory.upsert({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
    create: {
      userId,
      postSlug,
      progress,
      duration: duration ?? 0,
    },
    update: {
      progress,
      ...(duration !== undefined && { duration }),
    },
  })
}

export async function getReadingProgress(userId: string, postSlug: string) {
  const history = await prisma.readingHistory.findUnique({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
  })
  return history?.progress ?? 0
}

export async function deleteReadingHistory(userId: string, postSlug: string) {
  return prisma.readingHistory.delete({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
  })
}

export async function clearReadingHistory(userId: string) {
  return prisma.readingHistory.deleteMany({
    where: { userId },
  })
}
