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
  return prisma.comment.findMany({
    where: {
      postSlug,
      parentId: null,
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
      replies: {
        where: includeUnapproved ? {} : { isApproved: true },
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
      },
    },
    orderBy: { createdAt: 'desc' },
  })
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
