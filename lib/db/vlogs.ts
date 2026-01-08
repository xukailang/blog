import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (char) => char)
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36)
}

export interface CreateVlogData {
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  fileSize?: number
  isPublished?: boolean
}

export interface UpdateVlogData {
  title?: string
  description?: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  isPublished?: boolean
}

export async function createVlog(data: CreateVlogData) {
  const slug = generateSlug(data.title)

  return prisma.vlog.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      fileSize: data.fileSize,
      isPublished: data.isPublished || false,
      publishedAt: data.isPublished ? new Date() : null,
    },
  })
}

export async function getVlogById(id: string) {
  return prisma.vlog.findUnique({
    where: { id },
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })
}

export async function getVlogBySlug(slug: string) {
  return prisma.vlog.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })
}

export async function getAllVlogs(includeUnpublished = false) {
  return prisma.vlog.findMany({
    where: includeUnpublished ? {} : { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })
}

export async function updateVlog(id: string, data: UpdateVlogData) {
  const updateData: UpdateVlogData & { publishedAt?: Date | null } = { ...data }

  // If publishing for the first time
  if (data.isPublished) {
    const existing = await prisma.vlog.findUnique({ where: { id } })
    if (existing && !existing.isPublished) {
      updateData.publishedAt = new Date()
    }
  }

  return prisma.vlog.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteVlog(id: string) {
  return prisma.vlog.delete({
    where: { id },
  })
}

export async function incrementVlogViewCount(id: string) {
  return prisma.vlog.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })
}

export async function getVlogStats() {
  const [totalVlogs, totalViews, totalLikes] = await Promise.all([
    prisma.vlog.count({ where: { isPublished: true } }),
    prisma.vlog.aggregate({
      where: { isPublished: true },
      _sum: { viewCount: true },
    }),
    prisma.vlogLike.count(),
  ])

  return {
    totalVlogs,
    totalViews: totalViews._sum.viewCount || 0,
    totalLikes,
  }
}
