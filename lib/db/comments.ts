import { prisma } from '@/lib/prisma'

export interface CreateCommentData {
  content: string
  postSlug: string
  userId?: string
  guestName?: string
  guestEmail?: string
  parentId?: string
}

export async function createComment(data: CreateCommentData) {
  // Ensure PostMeta exists
  await prisma.postMeta.upsert({
    where: { slug: data.postSlug },
    create: { slug: data.postSlug },
    update: {},
  })

  // Auto-approve if user is logged in
  const isApproved = !!data.userId

  return prisma.comment.create({
    data: {
      content: data.content,
      postSlug: data.postSlug,
      userId: data.userId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      parentId: data.parentId,
      isApproved,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  })
}

export async function getCommentsByPostSlug(postSlug: string, includeUnapproved = false) {
  // 获取该文章的所有评论（扁平结构）
  const allComments = await prisma.comment.findMany({
    where: {
      postSlug,
      ...(includeUnapproved ? {} : { isApproved: true }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // 构建评论映射
  const commentMap = new Map<string, typeof allComments[0] & { replies: typeof allComments }>()

  // 初始化所有评论，添加空的 replies 数组
  allComments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // 构建树形结构
  const rootComments: (typeof allComments[0] & { replies: typeof allComments })[] = []

  allComments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!
    if (comment.parentId) {
      // 如果有父评论，添加到父评论的 replies 中
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    } else {
      // 顶级评论
      rootComments.push(commentWithReplies)
    }
  })

  // 按创建时间倒序排列顶级评论
  rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return rootComments
}

export async function getCommentById(id: string) {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  })
}

export async function approveComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { isApproved: true },
  })
}

export async function deleteComment(id: string) {
  return prisma.comment.delete({
    where: { id },
  })
}

export async function getPendingComments() {
  return prisma.comment.findMany({
    where: { isApproved: false },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllComments(limit = 50) {
  return prisma.comment.findMany({
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCommentCountByPostSlug(postSlug: string) {
  return prisma.comment.count({
    where: { postSlug, isApproved: true },
  })
}
