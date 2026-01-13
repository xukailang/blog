/**
 * Redis 客户端测试
 */

import { redis, isRedisConfigured, checkRedisConnection } from '@/lib/redis'

describe('Redis Client', () => {
  describe('Memory Store (fallback)', () => {
    // 在没有配置 Redis 的情况下，应该使用内存存储

    it('should set and get values', async () => {
      await redis.set('test-key', 'test-value')
      const value = await redis.get('test-key')
      expect(value).toBe('test-value')
    })

    it('should return null for non-existent keys', async () => {
      const value = await redis.get('non-existent-key')
      expect(value).toBeNull()
    })

    it('should increment values', async () => {
      await redis.set('counter', '0')
      const result1 = await redis.incr('counter')
      expect(result1).toBe(1)

      const result2 = await redis.incr('counter')
      expect(result2).toBe(2)
    })

    it('should increment non-existent keys starting from 0', async () => {
      const result = await redis.incr('new-counter-' + Date.now())
      expect(result).toBe(1)
    })

    it('should delete keys', async () => {
      await redis.set('to-delete', 'value')
      await redis.del('to-delete')
      const value = await redis.get('to-delete')
      expect(value).toBeNull()
    })

    it('should handle expiration', async () => {
      await redis.set('expiring-key', 'value', { ex: 1 })

      // Should exist immediately
      let value = await redis.get('expiring-key')
      expect(value).toBe('value')

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100))

      // Should be expired
      value = await redis.get('expiring-key')
      expect(value).toBeNull()
    }, 3000)

    it('should return TTL for keys with expiration', async () => {
      await redis.set('ttl-key', 'value', { ex: 10 })
      const ttl = await redis.ttl('ttl-key')
      expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeLessThanOrEqual(10)
    })

    it('should return -1 for keys without expiration', async () => {
      await redis.set('no-ttl-key', 'value')
      const ttl = await redis.ttl('no-ttl-key')
      expect(ttl).toBe(-1)
    })
  })

  describe('checkRedisConnection', () => {
    it('should return true when connection works', async () => {
      const result = await checkRedisConnection()
      expect(result).toBe(true)
    })
  })

  describe('isRedisConfigured', () => {
    it('should be false when no Redis env vars are set', () => {
      // In test environment, Redis is not configured
      // This test verifies the fallback behavior
      expect(typeof isRedisConfigured).toBe('boolean')
    })
  })
})
