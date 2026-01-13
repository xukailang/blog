import { prisma } from '@/lib/prisma'

// Web Push 配置
// 注意：需要在 .env 中配置 VAPID_PUBLIC_KEY 和 VAPID_PRIVATE_KEY
// 可以使用 web-push generate-vapid-keys 生成

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
}

// 保存推送订阅
export async function savePushSubscription(
  userId: string,
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  },
  userAgent?: string
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
  })
}

// 删除推送订阅
export async function deletePushSubscription(endpoint: string) {
  return prisma.pushSubscription.delete({
    where: { endpoint },
  }).catch(() => null) // 忽略不存在的情况
}

// 获取用户的所有推送订阅
export async function getUserPushSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({
    where: { userId },
  })
}

// 发送推送通知（需要安装 web-push 包）
export async function sendPushNotification(userId: string, payload: PushPayload) {
  // 检查用户通知偏好
  const preference = await prisma.notificationPreference.findUnique({
    where: { userId },
  })

  if (preference && !preference.pushEnabled) {
    return { sent: 0, failed: 0 }
  }

  const subscriptions = await getUserPushSubscriptions(userId)

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  // 动态导入 web-push（如果已安装）
  let webpush: typeof import('web-push') | null = null
  try {
    webpush = await import('web-push')
  } catch {
    console.warn('web-push not installed, skipping push notification')
    return { sent: 0, failed: 0 }
  }

  // 配置 VAPID
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured')
    return { sent: 0, failed: 0 }
  }

  webpush.setVapidDetails(
    'mailto:admin@example.com',
    vapidPublicKey,
    vapidPrivateKey
  )

  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      )
      sent++
    } catch (error: unknown) {
      failed++
      // 如果订阅已失效，删除它
      if (error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 410) {
        await deletePushSubscription(sub.endpoint)
      }
    }
  }

  return { sent, failed }
}

// 获取 VAPID 公钥（用于客户端订阅）
export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null
}
