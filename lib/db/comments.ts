import { prisma } from '@/lib/prisma'
import { ReportReason, ReportStatus } from '@prisma/client'

export interface CreateCommentData {
  content: string
  postSlug: string
  userId?: string
  guestName?: string
  guestEmail?: string
  parentId?: string
}

// 支持的表情类型
export const EMOJI_TYPES = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'] as const
export type EmojiType = typeof EMOJI_TYPES[number]

// 表情显示配置
export const EMOJI_CONFIG: Record<EmojiType, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: '赞' },
  love: { emoji: '❤️', label: '喜欢' },
  laugh: { emoji: '😄', label: '哈哈' },
  wow: { emoji: '😮', label: '惊讶' },
  sad: { emoji: '😢', label: '难过' },
  angry: { emoji: '😠', label: '生气' },
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
      reactions: true,
    },
  })
}

export async function updateComment(id: string, content: string, userId: string) {
  // 验证评论所有权
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!comment || comment.userId !== userId) {
    throw new Error('无权编辑此评论')
  }

  return prisma.comment.update({
    where: { id },
    data: {
      content,
      isEdited: true,
      editedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      reactions: true,
    },
  })
}

export type CommentSortType = 'newest' | 'oldest' | 'popular'

export async function getCommentsByPostSlug(
  postSlug: string,
  options: {
    includeUnapproved?: boolean
    sort?: CommentSortType
  } = {}
) {
  const { includeUnapproved = false, sort = 'newest' } = options

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
      reactions: true,
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // 计算每个评论的反应统计
  const commentsWithStats = allComments.map((comment) => {
    const reactionCounts: Record<string, number> = {}
    comment.reactions.forEach((r) => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
    })
    return {
      ...comment,
      reactionCounts,
      totalReactions: comment.reactions.length,
    }
  })

  // 构建评论映射
  type CommentWithReplies = (typeof commentsWithStats)[0] & { replies: typeof commentsWithStats }
  const commentMap = new Map<string, CommentWithReplies>()

  // 初始化所有评论，添加空的 replies 数组
  commentsWithStats.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // 构建树形结构
  const rootComments: CommentWithReplies[] = []

  commentsWithStats.forEach((comment) => {
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

  // 根据排序方式排序顶级评论
  switch (sort) {
    case 'oldest':
      rootComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
    case 'popular':
      rootComments.sort((a, b) => {
        const aScore = a.totalReactions + a._count.replies * 2
        const bScore = b.totalReactions + b._count.replies * 2
        return bScore - aScore
      })
      break
    case 'newest':
    default:
      rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }

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
      reactions: true,
    },
  })
}

export async function approveComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { isApproved: true },
  })
}

export async function deleteComment(id: string, userId?: string) {
  // 如果提供了 userId，验证所有权
  if (userId) {
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!comment || comment.userId !== userId) {
      throw new Error('无权删除此评论')
    }
  }

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

// ============ 评论反应功能 ============

export async function toggleCommentReaction(
  commentId: string,
  emoji: EmojiType,
  userId?: string,
  ipHash?: string
) {
  if (!userId && !ipHash) {
    throw new Error('需要用户ID或IP哈希')
  }

  // 检查是否已存在该反应
  const existing = await prisma.commentReaction.findFirst({
    where: {
      commentId,
      emoji,
      ...(userId ? { userId } : { ipHash }),
    },
  })

  if (existing) {
    // 已存在则删除（取消反应）
    await prisma.commentReaction.delete({
      where: { id: existing.id },
    })
    return { action: 'removed' as const }
  } else {
    // 不存在则创建
    await prisma.commentReaction.create({
      data: {
        commentId,
        emoji,
        userId,
        ipHash: userId ? null : ipHash,
      },
    })
    return { action: 'added' as const }
  }
}

export async function getCommentReactions(commentId: string) {
  const reactions = await prisma.commentReaction.findMany({
    where: { commentId },
  })

  // 统计每种表情的数量
  const counts: Record<string, number> = {}
  reactions.forEach((r) => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1
  })

  return {
    counts,
    total: reactions.length,
    reactions,
  }
}

export async function getUserReactionForComment(
  commentId: string,
  userId?: string,
  ipHash?: string
): Promise<string[]> {
  if (!userId && !ipHash) return []

  const reactions = await prisma.commentReaction.findMany({
    where: {
      commentId,
      ...(userId ? { userId } : { ipHash }),
    },
    select: { emoji: true },
  })

  return reactions.map((r) => r.emoji)
}

// ============ 评论举报功能 ============

export async function reportComment(
  commentId: string,
  reason: ReportReason,
  detail?: string,
  userId?: string,
  ipHash?: string
) {
  if (!userId && !ipHash) {
    throw new Error('需要用户ID或IP哈希')
  }

  // 检查是否已举报过
  const existing = await prisma.commentReport.findFirst({
    where: {
      commentId,
      ...(userId ? { userId } : { ipHash }),
    },
  })

  if (existing) {
    throw new Error('您已举报过此评论')
  }

  return prisma.commentReport.create({
    data: {
      commentId,
      reason,
      detail,
      userId,
      ipHash: userId ? null : ipHash,
    },
  })
}

export async function getPendingReports() {
  return prisma.commentReport.findMany({
    where: { status: ReportStatus.PENDING },
    include: {
      comment: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function resolveReport(id: string, status: ReportStatus) {
  return prisma.commentReport.update({
    where: { id },
    data: {
      status,
      resolvedAt: new Date(),
    },
  })
}

export async function getReportCountForComment(commentId: string) {
  return prisma.commentReport.count({
    where: { commentId },
  })
}
