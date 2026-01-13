import { prisma } from '@/lib/prisma'

export interface NotificationPreferenceData {
  emailEnabled?: boolean
  pushEnabled?: boolean
  commentReply?: boolean
  postLike?: boolean
  mention?: boolean
  system?: boolean
  emailDigest?: 'instant' | 'daily' | 'weekly' | 'none'
  quietHoursStart?: number | null
  quietHoursEnd?: number | null
}

// 获取用户通知偏好
export async function getNotificationPreference(userId: string) {
  let preference = await prisma.notificationPreference.findUnique({
    where: { userId },
  })

  // 如果不存在，创建默认偏好
  if (!preference) {
    preference = await prisma.notificationPreference.create({
      data: { userId },
    })
  }

  return preference
}

// 更新用户通知偏好
export async function updateNotificationPreference(
  userId: string,
  data: NotificationPreferenceData
) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  })
}

// 检查是否应该发送通知
export async function shouldSendNotification(
  userId: string,
  type: 'commentReply' | 'postLike' | 'mention' | 'system'
): Promise<{ email: boolean; push: boolean }> {
  const preference = await getNotificationPreference(userId)

  // 检查是否在静默时间
  if (preference.quietHoursStart !== null && preference.quietHoursEnd !== null) {
    const now = new Date()
    const currentHour = now.getHours()

    const start = preference.quietHoursStart
    const end = preference.quietHoursEnd

    // 处理跨午夜的情况
    const inQuietHours = start <= end
      ? currentHour >= start && currentHour < end
      : currentHour >= start || currentHour < end

    if (inQuietHours) {
      return { email: false, push: false }
    }
  }

  // 检查特定类型的通知是否启用
  const typeEnabled = preference[type] ?? true

  return {
    email: preference.emailEnabled && typeEnabled,
    push: preference.pushEnabled && typeEnabled,
  }
}
