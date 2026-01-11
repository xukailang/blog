import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function subscribe(email: string, name?: string) {
  const existingSubscriber = await prisma.subscriber.findUnique({
    where: { email },
  })

  if (existingSubscriber) {
    if (existingSubscriber.isVerified && !existingSubscriber.unsubscribedAt) {
      return { success: false, error: '该邮箱已订阅' }
    }

    // Re-subscribe if previously unsubscribed
    if (existingSubscriber.unsubscribedAt) {
      const verifyToken = generateToken()
      await prisma.subscriber.update({
        where: { email },
        data: {
          name,
          isVerified: false,
          verifyToken,
          unsubscribedAt: null,
        },
      })
      return { success: true, verifyToken, isResubscribe: true }
    }

    // Resend verification if not verified
    if (!existingSubscriber.isVerified) {
      const verifyToken = generateToken()
      await prisma.subscriber.update({
        where: { email },
        data: { verifyToken, name },
      })
      return { success: true, verifyToken, isResend: true }
    }
  }

  const verifyToken = generateToken()
  const unsubToken = generateToken()

  await prisma.subscriber.create({
    data: {
      email,
      name,
      verifyToken,
      unsubToken,
    },
  })

  return { success: true, verifyToken }
}

export async function verifySubscription(token: string) {
  const subscriber = await prisma.subscriber.findUnique({
    where: { verifyToken: token },
  })

  if (!subscriber) {
    return { success: false, error: '无效的验证链接' }
  }

  if (subscriber.isVerified) {
    return { success: false, error: '该邮箱已验证' }
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      isVerified: true,
      verifyToken: null,
      verifiedAt: new Date(),
    },
  })

  return { success: true, email: subscriber.email }
}

export async function unsubscribe(token: string) {
  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubToken: token },
  })

  if (!subscriber) {
    return { success: false, error: '无效的退订链接' }
  }

  if (subscriber.unsubscribedAt) {
    return { success: false, error: '该邮箱已退订' }
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      unsubscribedAt: new Date(),
    },
  })

  return { success: true, email: subscriber.email }
}

export async function getSubscriberCount() {
  return prisma.subscriber.count({
    where: {
      isVerified: true,
      unsubscribedAt: null,
    },
  })
}

export async function getActiveSubscribers() {
  return prisma.subscriber.findMany({
    where: {
      isVerified: true,
      unsubscribedAt: null,
    },
    select: {
      email: true,
      name: true,
      unsubToken: true,
    },
  })
}

export async function isSubscribed(email: string) {
  const subscriber = await prisma.subscriber.findUnique({
    where: { email },
  })

  return subscriber?.isVerified && !subscriber?.unsubscribedAt
}
