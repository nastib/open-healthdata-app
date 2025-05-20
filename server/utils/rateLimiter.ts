import { H3Event } from 'h3'
import { createError } from 'h3'
import { useStorage } from '#imports'

interface RateLimiterOptions {
  max: number
  windowMs: number
}

export async function useRateLimiter(event: H3Event, options: RateLimiterOptions) {
  const storage = useStorage('rate-limits')
  const ip = event.node.req.socket.remoteAddress || 'unknown'
  const key = `rate-limit:${ip}`

  const current = await storage.getItem(key) as { count: number, resetTime: number } | null

  if (current) {
    if (current.count >= options.max) {
      if (Date.now() < current.resetTime) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Too Many Requests',
          data: {
            message: `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - Date.now()) / 1000)} seconds`
          }
        })
      } else {
        // Reset if window has passed
        await storage.setItem(key, { count: 1, resetTime: Date.now() + options.windowMs })
      }
    } else {
      // Increment count
      await storage.setItem(key, { count: current.count + 1, resetTime: current.resetTime })
    }
  } else {
    // First request
    await storage.setItem(key, { count: 1, resetTime: Date.now() + options.windowMs })
  }
}
