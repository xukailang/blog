import { prisma } from '@/lib/prisma'

/**
 * 定时发布服务
 *
 * 用于管理文章的定时发布功能
 */

// 设置文章定时发布
export async function schedulePost(slug: string, scheduledAt: Date) {
  return prisma.postMeta.upsert({
    where: { slug },
    create: {
      slug,
      scheduledAt,
      isPublished: false,
    },
    update: {
      scheduledAt,
      isPublished: false,
    },
  })
}

// 取消定时发布
export async function cancelScheduledPost(slug: string) {
  return prisma.postMeta.update({
    where: { slug },
    data: {
      scheduledAt: null,
      isPublished: true,
    },
  })
}

// 立即发布文章
export async function publishPost(slug: string) {
  return prisma.postMeta.upsert({
    where: { slug },
    create: {
      slug,
      isPublished: true,
      scheduledAt: null,
    },
    update: {
      isPublished: true,
      scheduledAt: null,
    },
  })
}

// 取消发布（设为草稿）
export async function unpublishPost(slug: string) {
  return prisma.postMeta.update({
    where: { slug },
    data: {
      isPublished: false,
      scheduledAt: null,
    },
  })
}

// 获取待发布的文章（定时时间已到）
export async function getPostsToPublish() {
  const now = new Date()

  return prisma.postMeta.findMany({
    where: {
      isPublished: false,
      scheduledAt: {
        lte: now,
        not: null,
      },
    },
  })
}

// 发布所有到期的定时文章
export async function publishScheduledPosts() {
  const postsToPublish = await getPostsToPublish()

  if (postsToPublish.length === 0) {
    return { published: 0, slugs: [] }
  }

  const slugs = postsToPublish.map((p) => p.slug)

  await prisma.postMeta.updateMany({
    where: {
      slug: { in: slugs },
    },
    data: {
      isPublished: true,
      scheduledAt: null,
    },
  })

  return {
    published: slugs.length,
    slugs,
  }
}

// 获取所有定时发布的文章
export async function getScheduledPosts() {
  return prisma.postMeta.findMany({
    where: {
      isPublished: false,
      scheduledAt: {
        not: null,
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })
}

// 获取文章的发布状态
export async function getPostPublishStatus(slug: string) {
  const meta = await prisma.postMeta.findUnique({
    where: { slug },
    select: {
      isPublished: true,
      scheduledAt: true,
    },
  })

  if (!meta) {
    return {
      status: 'published' as const,
      scheduledAt: null,
    }
  }

  if (meta.isPublished) {
    return {
      status: 'published' as const,
      scheduledAt: null,
    }
  }

  if (meta.scheduledAt) {
    return {
      status: 'scheduled' as const,
      scheduledAt: meta.scheduledAt,
    }
  }

  return {
    status: 'draft' as const,
    scheduledAt: null,
  }
}

// 检查文章是否可见（已发布或定时时间已到）
export async function isPostVisible(slug: string): Promise<boolean> {
  const meta = await prisma.postMeta.findUnique({
    where: { slug },
    select: {
      isPublished: true,
      scheduledAt: true,
    },
  })

  // 如果没有元数据，默认可见
  if (!meta) return true

  // 已发布
  if (meta.isPublished) return true

  // 定时发布且时间已到
  if (meta.scheduledAt && meta.scheduledAt <= new Date()) {
    // 自动发布
    await publishPost(slug)
    return true
  }

  return false
}
