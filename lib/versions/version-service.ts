import { prisma } from '@/lib/prisma'

export interface VersionData {
  postSlug: string
  title: string
  content: string
  description?: string
  tags?: string[]
  category?: string
  coverImage?: string
  changeNote?: string
  createdBy?: string
}

// 创建新版本
export async function createVersion(data: VersionData) {
  // 获取当前最新版本号
  const latestVersion = await prisma.postVersion.findFirst({
    where: { postSlug: data.postSlug },
    orderBy: { version: 'desc' },
    select: { version: true },
  })

  const newVersion = (latestVersion?.version || 0) + 1

  return prisma.postVersion.create({
    data: {
      postSlug: data.postSlug,
      version: newVersion,
      title: data.title,
      content: data.content,
      description: data.description,
      tags: data.tags || [],
      category: data.category,
      coverImage: data.coverImage,
      changeNote: data.changeNote,
      createdBy: data.createdBy,
    },
  })
}

// 获取文章的所有版本
export async function getVersions(postSlug: string, limit = 50) {
  return prisma.postVersion.findMany({
    where: { postSlug },
    orderBy: { version: 'desc' },
    take: limit,
    select: {
      id: true,
      version: true,
      title: true,
      changeNote: true,
      createdBy: true,
      createdAt: true,
    },
  })
}

// 获取特定版本
export async function getVersion(postSlug: string, version: number) {
  return prisma.postVersion.findUnique({
    where: {
      postSlug_version: {
        postSlug,
        version,
      },
    },
  })
}

// 获取版本详情（通过 ID）
export async function getVersionById(id: string) {
  return prisma.postVersion.findUnique({
    where: { id },
  })
}

// 获取最新版本
export async function getLatestVersion(postSlug: string) {
  return prisma.postVersion.findFirst({
    where: { postSlug },
    orderBy: { version: 'desc' },
  })
}

// 删除旧版本（保留最近 N 个版本）
export async function pruneOldVersions(postSlug: string, keepCount = 50) {
  const versions = await prisma.postVersion.findMany({
    where: { postSlug },
    orderBy: { version: 'desc' },
    select: { id: true },
  })

  if (versions.length > keepCount) {
    const toDelete = versions.slice(keepCount).map(v => v.id)
    await prisma.postVersion.deleteMany({
      where: { id: { in: toDelete } },
    })
  }
}

// 获取版本数量
export async function getVersionCount(postSlug: string) {
  return prisma.postVersion.count({
    where: { postSlug },
  })
}
