import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth-users'
import { getNotifications, getUnreadCount } from '@/lib/db/notifications'

// SSE 实时通知流
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // 发送初始连接确认
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'))

      // 发送初始未读数量
      const unreadCount = await getUnreadCount(user.id)
      controller.enqueue(
        encoder.encode(`event: unread\ndata: ${JSON.stringify({ count: unreadCount })}\n\n`)
      )

      // 定期检查新通知
      let lastCheck = new Date()
      const interval = setInterval(async () => {
        try {
          // 获取最新通知
          const notifications = await getNotifications(user.id, {
            limit: 5,
            unreadOnly: true,
          })

          // 过滤出新通知
          const newNotifications = notifications.filter(
            n => new Date(n.createdAt) > lastCheck
          )

          if (newNotifications.length > 0) {
            controller.enqueue(
              encoder.encode(`event: notification\ndata: ${JSON.stringify(newNotifications)}\n\n`)
            )
            lastCheck = new Date()
          }

          // 发送心跳
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch (error) {
          console.error('SSE notification error:', error)
        }
      }, 10000) // 每 10 秒检查一次

      // 清理
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // 禁用 nginx 缓冲
    },
  })
}
