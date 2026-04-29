// ============================================================
// VOIX — Simple In-Memory Rate Limiter
// For production, replace with Redis (Upstash, etc.)
// ============================================================

interface RateLimitRecord {
  count: number
  resetAt: number
}

const cache = new Map<string, RateLimitRecord>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const record = cache.get(identifier)

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = { count: 1, resetAt: now + windowMs }
    cache.set(identifier, newRecord)
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: newRecord.resetAt }
  }

  if (record.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: record.resetAt }
  }

  record.count++
  return { success: true, limit: maxRequests, remaining: maxRequests - record.count, reset: record.resetAt }
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of cache.entries()) {
    if (now > record.resetAt) {
      cache.delete(key)
    }
  }
}, 10 * 60 * 1000)
