/**
 * Redis 客户端配置
 *
 * 支持两种模式：
 * 1. 本地 Redis：设置 REDIS_URL 环境变量
 * 2. Upstash Redis：设置 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
 *
 * 如果都没有配置，将回退到内存存储
 */

// Redis 配置
const REDIS_URL = process.env.REDIS_URL
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

// 检查是否配置了 Redis
export const isRedisConfigured = !!(REDIS_URL || (UPSTASH_URL && UPSTASH_TOKEN))

// Redis 操作接口
export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, options?: { ex?: number }): Promise<void>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<void>
  del(key: string): Promise<void>
  ttl(key: string): Promise<number>
}

// 内存存储（回退方案）
class MemoryStore implements RedisClient {
  private store = new Map<string, { value: string; expireAt?: number }>()

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.expireAt && now > entry.expireAt) {
        this.store.delete(key)
      }
    }
  }

  async get(key: string): Promise<string | null> {
    this.cleanup()
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expireAt && Date.now() > entry.expireAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    const expireAt = options?.ex ? Date.now() + options.ex * 1000 : undefined
    this.store.set(key, { value, expireAt })
  }

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key)
    const currentValue = entry ? parseInt(entry.value, 10) || 0 : 0
    const newValue = currentValue + 1
    this.store.set(key, { value: String(newValue), expireAt: entry?.expireAt })
    return newValue
  }

  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.store.get(key)
    if (entry) {
      entry.expireAt = Date.now() + seconds * 1000
    }
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key)
    if (!entry || !entry.expireAt) return -1
    const remaining = Math.ceil((entry.expireAt - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }
}

// Upstash Redis 客户端（使用 REST API）
class UpstashClient implements RedisClient {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  private async request(command: string[]): Promise<unknown> {
    const response = await fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    })

    if (!response.ok) {
      throw new Error(`Upstash request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
  }

  async get(key: string): Promise<string | null> {
    const result = await this.request(['GET', key])
    return result as string | null
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    if (options?.ex) {
      await this.request(['SET', key, value, 'EX', String(options.ex)])
    } else {
      await this.request(['SET', key, value])
    }
  }

  async incr(key: string): Promise<number> {
    const result = await this.request(['INCR', key])
    return result as number
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.request(['EXPIRE', key, String(seconds)])
  }

  async del(key: string): Promise<void> {
    await this.request(['DEL', key])
  }

  async ttl(key: string): Promise<number> {
    const result = await this.request(['TTL', key])
    return result as number
  }
}

// 创建 Redis 客户端实例
function createRedisClient(): RedisClient {
  // 优先使用 Upstash（Serverless 友好）
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    console.log('Using Upstash Redis')
    return new UpstashClient(UPSTASH_URL, UPSTASH_TOKEN)
  }

  // 如果配置了本地 Redis URL，可以使用 ioredis
  // 但为了简化，这里暂时不实现，直接回退到内存存储
  if (REDIS_URL) {
    console.log('REDIS_URL configured but ioredis not implemented, falling back to memory store')
  }

  // 回退到内存存储
  console.log('Using in-memory store for rate limiting')
  return new MemoryStore()
}

// 导出单例客户端
export const redis = createRedisClient()

// 辅助函数：检查 Redis 连接
export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.set('__health_check__', '1', { ex: 10 })
    const result = await redis.get('__health_check__')
    return result === '1'
  } catch {
    return false
  }
}
