interface CacheEntry {
  value: any
  expires?: number
}

// Singleton cache storage
const cache = new Map<string, CacheEntry>()

export const useCache = () => {

  return {
    async get(key: string) {

      const entry = cache.get(key)

      if (!entry) return null

      if (entry.expires && Date.now() > entry.expires) {
        cache.delete(key)
        return null
      }

      return entry.value
    },

    async set(key: string, value: any, ttl?: number) {
      const expires = ttl ? Date.now() + ttl * 1000 : undefined

      cache.set(key, { value, expires })

    },

    async remove(key: string) {
      cache.delete(key)
    },

    async clear() {
      cache.clear()
    },
  }
}
