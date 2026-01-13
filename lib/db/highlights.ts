import { prisma } from '@/lib/prisma'

// 高亮颜色选项
export const HIGHLIGHT_COLORS = [
  { name: '黄色', value: '#ffff00' },
  { name: '绿色', value: '#90EE90' },
  { name: '蓝色', value: '#87CEEB' },
  { name: '粉色', value: '#FFB6C1' },
  { name: '橙色', value: '#FFA500' },
] as const

export type HighlightColor = typeof HIGHLIGHT_COLORS[number]['value']

export interface CreateHighlightData {
  userId: string
  postSlug: string
  text: string
  note?: string
  color?: string
  startOffset: number
  endOffset: number
  selector?: string
}

export interface UpdateHighlightData {
  note?: string
  color?: string
}

// 创建高亮
export async function createHighlight(data: CreateHighlightData) {
  return prisma.highlight.create({
    data: {
      userId: data.userId,
      postSlug: data.postSlug,
      text: data.text,
      note: data.note,
      color: data.color || '#ffff00',
      startOffset: data.startOffset,
      endOffset: data.endOffset,
      selector: data.selector,
    },
  })
}

// 更新高亮
export async function updateHighlight(id: string, userId: string, data: UpdateHighlightData) {
  // 验证所有权
  const highlight = await prisma.highlight.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!highlight || highlight.userId !== userId) {
    throw new Error('无权修改此高亮')
  }

  return prisma.highlight.update({
    where: { id },
    data: {
      note: data.note,
      color: data.color,
    },
  })
}

// 删除高亮
export async function deleteHighlight(id: string, userId: string) {
  // 验证所有权
  const highlight = await prisma.highlight.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!highlight || highlight.userId !== userId) {
    throw new Error('无权删除此高亮')
  }

  return prisma.highlight.delete({
    where: { id },
  })
}

// 获取用户在某篇文章的所有高亮
export async function getHighlightsByPostSlug(userId: string, postSlug: string) {
  return prisma.highlight.findMany({
    where: {
      userId,
      postSlug,
    },
    orderBy: { startOffset: 'asc' },
  })
}

// 获取用户的所有高亮
export async function getUserHighlights(userId: string, limit = 50) {
  return prisma.highlight.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

// 获取用户高亮统计
export async function getUserHighlightStats(userId: string) {
  const [total, byPost] = await Promise.all([
    prisma.highlight.count({ where: { userId } }),
    prisma.highlight.groupBy({
      by: ['postSlug'],
      where: { userId },
      _count: true,
    }),
  ])

  return {
    total,
    postCount: byPost.length,
    byPost,
  }
}

// ============ 书签功能 ============

export interface CreateBookmarkData {
  userId: string
  postSlug: string
  title?: string
  note?: string
  position?: number
  selector?: string
}

// 创建或更新书签
export async function upsertBookmark(data: CreateBookmarkData) {
  return prisma.bookmark.upsert({
    where: {
      userId_postSlug: {
        userId: data.userId,
        postSlug: data.postSlug,
      },
    },
    create: {
      userId: data.userId,
      postSlug: data.postSlug,
      title: data.title,
      note: data.note,
      position: data.position || 0,
      selector: data.selector,
    },
    update: {
      title: data.title,
      note: data.note,
      position: data.position,
      selector: data.selector,
    },
  })
}

// 删除书签
export async function deleteBookmark(userId: string, postSlug: string) {
  return prisma.bookmark.delete({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
  })
}

// 获取用户在某篇文章的书签
export async function getBookmarkByPostSlug(userId: string, postSlug: string) {
  return prisma.bookmark.findUnique({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
  })
}

// 获取用户的所有书签
export async function getUserBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

// 检查用户是否已添加书签
export async function hasBookmark(userId: string, postSlug: string): Promise<boolean> {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postSlug: {
        userId,
        postSlug,
      },
    },
    select: { id: true },
  })

  return !!bookmark
}
