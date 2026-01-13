import { NextRequest, NextResponse } from 'next/server'
import { redis, isRedisConfigured } from './redis'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (fallback when Redis is not available)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically (only for memory store)
if (!isRedisConfigured) {
  setInterval(() => {
    const now = Date.now()
    const keysToDelete: string[] = []
    rateLimitStore.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => rateLimitStore.delete(key))
  }, 60000) // Clean up every minute
}

// Default configurations for different API types
export const rateLimitConfigs = {
  // General API endpoints
  default: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 60,        // 60 requests per minute
  },
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,          // 10 attempts per 15 minutes
  },
  // Search endpoints
  search: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 30,        // 30 searches per minute
  },
  // Comment/Like endpoints
  interaction: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 20,        // 20 interactions per minute
  },
  // Upload endpoints (very strict)
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,          // 20 uploads per hour
  },
  // Admin endpoints
  admin: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 100,       // 100 requests per minute
  },
}

export type RateLimitType = keyof typeof rateLimitConfigs

function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'

  // Combine with user agent for more unique identification
  const userAgent = request.headers.get('user-agent') || 'unknown'

  return `${ip}:${userAgent.substring(0, 50)}`
}

// Redis-based rate limiting with sliding window
async function rateLimitWithRedis(
  key: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const windowSeconds = Math.ceil(config.windowMs / 1000)
  const now = Date.now()

  try {
    // 使用 Redis INCR 和 EXPIRE 实现滑动窗口
    const count = await redis.incr(key)

    // 如果是第一次请求，设置过期时间
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }

    // 获取剩余时间
    const ttl = await redis.ttl(key)
    const resetTime = now + (ttl > 0 ? ttl * 1000 : config.windowMs)

    const remaining = Math.max(0, config.maxRequests - count)
    const success = count <= config.maxRequests

    return { success, remaining, resetTime }
  } catch (error) {
    console.error('Redis rate limit error:', error)
    // 如果 Redis 出错，回退到内存存储
    return rateLimitWithMemory(key, config)
  }
}

// Memory-based rate limiting (fallback)
function rateLimitWithMemory(
  key: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const success = entry.count <= config.maxRequests

  return {
    success,
    remaining,
    resetTime: entry.resetTime,
  }
}

export function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'default'
): { success: boolean; remaining: number; resetTime: number } {
  const config = rateLimitConfigs[type]
  const clientId = getClientIdentifier(request)
  const key = `ratelimit:${type}:${clientId}`

  // 同步版本，用于向后兼容
  // 如果需要使用 Redis，请使用 rateLimitAsync
  return rateLimitWithMemory(key, config)
}

// 异步版本，支持 Redis
export async function rateLimitAsync(
  request: NextRequest,
  type: RateLimitType = 'default'
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const config = rateLimitConfigs[type]
  const clientId = getClientIdentifier(request)
  const key = `ratelimit:${type}:${clientId}`

  if (isRedisConfigured) {
    return rateLimitWithRedis(key, config)
  }

  return rateLimitWithMemory(key, config)
}

export function createRateLimitResponse(
  resetTime: number,
  type: RateLimitType = 'default'
): NextResponse {
  const config = rateLimitConfigs[type]
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

  return NextResponse.json(
    {
      error: '请求过于频繁，请稍后再试',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(config.maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
      },
    }
  )
}

export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number,
  type: RateLimitType = 'default'
): NextResponse {
  const config = rateLimitConfigs[type]

  response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)))

  return response
}

// Middleware helper for easy integration (sync version)
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: RateLimitType = 'default'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { success, remaining, resetTime } = rateLimit(request, type)

    if (!success) {
      return createRateLimitResponse(resetTime, type)
    }

    const response = await handler(request)
    return addRateLimitHeaders(response, remaining, resetTime, type)
  }
}

// Middleware helper for easy integration (async version with Redis support)
export function withRateLimitAsync(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: RateLimitType = 'default'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { success, remaining, resetTime } = await rateLimitAsync(request, type)

    if (!success) {
      return createRateLimitResponse(resetTime, type)
    }

    const response = await handler(request)
    return addRateLimitHeaders(response, remaining, resetTime, type)
  }
}
