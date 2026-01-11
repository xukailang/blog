import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  content?: string
  link?: string
  metadata?: Record<string, unknown>
}

export async function createNotification(data: CreateNotificationData) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      link: data.link,
      metadata: data.metadata,
    },
  })
}

export async function getNotifications(
  userId: string,
  options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
  } = {}
) {
  const { limit = 20, offset = 0, unreadOnly = false } = options

  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { isRead: true },
  })
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  })
}

export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
    },
  })
}

export async function deleteAllNotifications(userId: string) {
  return prisma.notification.deleteMany({
    where: { userId },
  })
}

// Helper functions to create specific notification types
export async function notifyCommentReply(
  userId: string,
  commenterName: string,
  postSlug: string,
  postTitle: string
) {
  return createNotification({
    userId,
    type: 'COMMENT_REPLY',
    title: '收到新回复',
    content: `${commenterName} 回复了你在「${postTitle}」的评论`,
    link: `/blog/${postSlug}#comments`,
    metadata: { commenterName, postSlug, postTitle },
  })
}

export async function notifyPostLike(
  userId: string,
  likerName: string,
  postSlug: string,
  postTitle: string
) {
  return createNotification({
    userId,
    type: 'POST_LIKE',
    title: '文章获得点赞',
    content: `${likerName} 赞了你的文章「${postTitle}」`,
    link: `/blog/${postSlug}`,
    metadata: { likerName, postSlug, postTitle },
  })
}

export async function notifyMention(
  userId: string,
  mentionerName: string,
  postSlug: string,
  postTitle: string
) {
  return createNotification({
    userId,
    type: 'MENTION',
    title: '有人提到了你',
    content: `${mentionerName} 在「${postTitle}」中提到了你`,
    link: `/blog/${postSlug}#comments`,
    metadata: { mentionerName, postSlug, postTitle },
  })
}

export async function notifySystem(
  userId: string,
  title: string,
  content: string,
  link?: string
) {
  return createNotification({
    userId,
    type: 'SYSTEM',
    title,
    content,
    link,
  })
}
