import { prisma } from '@/lib/prisma'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface CreateSeriesData {
  name: string
  description?: string
  coverImage?: string
  color?: string
  isPublished?: boolean
}

export interface UpdateSeriesData {
  name?: string
  description?: string
  coverImage?: string
  color?: string
  isPublished?: boolean
  sortOrder?: number
}

export async function getAllSeries(includeUnpublished = false) {
  return prisma.series.findMany({
    where: includeUnpublished ? {} : { isPublished: true },
    include: {
      posts: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getSeriesById(id: string) {
  return prisma.series.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function getSeriesBySlug(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      posts: {
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function getSeriesByPostSlug(postSlug: string) {
  const seriesPost = await prisma.seriesPost.findFirst({
    where: { postSlug },
    include: {
      series: {
        include: {
          posts: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!seriesPost) return null

  const posts = seriesPost.series.posts
  const currentIndex = posts.findIndex((p) => p.postSlug === postSlug)

  return {
    series: seriesPost.series,
    currentIndex,
    totalPosts: posts.length,
    prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  }
}

export async function createSeries(data: CreateSeriesData) {
  const slug = generateSlug(data.name)

  return prisma.series.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      coverImage: data.coverImage,
      color: data.color,
      isPublished: data.isPublished ?? true,
    },
  })
}

export async function updateSeries(id: string, data: UpdateSeriesData) {
  const updateData: Record<string, unknown> = { ...data }

  if (data.name) {
    updateData.slug = generateSlug(data.name)
  }

  return prisma.series.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteSeries(id: string) {
  return prisma.series.delete({
    where: { id },
  })
}

export async function addPostToSeries(seriesId: string, postSlug: string, order?: number) {
  const maxOrder = await prisma.seriesPost.aggregate({
    where: { seriesId },
    _max: { order: true },
  })

  return prisma.seriesPost.create({
    data: {
      seriesId,
      postSlug,
      order: order ?? (maxOrder._max.order ?? -1) + 1,
    },
  })
}

export async function removePostFromSeries(seriesId: string, postSlug: string) {
  return prisma.seriesPost.delete({
    where: {
      seriesId_postSlug: {
        seriesId,
        postSlug,
      },
    },
  })
}

export async function updateSeriesPostOrder(seriesId: string, posts: { postSlug: string; order: number }[]) {
  const updates = posts.map((post) =>
    prisma.seriesPost.update({
      where: {
        seriesId_postSlug: {
          seriesId,
          postSlug: post.postSlug,
        },
      },
      data: { order: post.order },
    })
  )

  return prisma.$transaction(updates)
}
