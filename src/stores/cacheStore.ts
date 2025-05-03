import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Define cache entry interface
interface CacheEntry {
  data: any
  timestamp: number
  expiresAt: number
}

interface CacheState {
  [key: string]: CacheEntry
}

// Cache duration in milliseconds (1 day)
const CACHE_DURATION = 1 * 24 * 60 * 60 * 1000
// Define a version for the cache structure or application
const CACHE_VERSION = '1.0.0' // Increment this version when cache structure changes or needs invalidation
const STORAGE_VERSION_KEY = 'cacheVersion'

export const useCacheStore = defineStore('cache', () => {
  // State: a map of cache keys to cache entries
  const cache = ref<CacheState>({})

  // Actions
  function set(key: string, data: any, customDuration?: number) {
    const now = Date.now()
    const duration = customDuration || CACHE_DURATION

    cache.value[key] = {
      data,
      timestamp: now,
      expiresAt: now + duration
    }
  }

  function get(key: string): any {
    const entry = cache.value[key]

    // If entry doesn't exist or is expired, return null
    if (!entry || Date.now() > entry.expiresAt) {
      // Clean up expired entry
      if (entry) {
        delete cache.value[key]
      }
      return null
    }

    return entry.data
  }

  function has(key: string): boolean {
    const entry = cache.value[key]
    return entry !== undefined && Date.now() <= entry.expiresAt
  }

  function remove(key: string) {
    delete cache.value[key]
  }

  function clearAll() {
    cache.value = {}
    console.log('Cache cleared completely.')
  }

  // Clear expired entries
  function clearExpired() {
    const now = Date.now()
    Object.keys(cache.value).forEach((key) => {
      if (cache.value[key].expiresAt < now) {
        delete cache.value[key]
      }
    })
  }

  // Initialization logic
  function initializeCache() {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)

      if (storedVersion !== CACHE_VERSION) {
        console.log(
          `Cache version mismatch (stored: ${storedVersion}, current: ${CACHE_VERSION}). Clearing cache.`
        )
        clearAll()
        localStorage.setItem(STORAGE_VERSION_KEY, CACHE_VERSION)
      } else {
        // Versions match, just clear expired items
        clearExpired()
        console.log('Cache version matches. Cleared expired entries.')
      }
    } catch (error) {
      console.error('Failed to initialize cache:', error)
      // Fallback: clear everything if error occurs during version check
      clearAll()
      // Attempt to set version again if possible
      try {
        localStorage.setItem(STORAGE_VERSION_KEY, CACHE_VERSION)
      } catch (setError) {
        console.error('Failed to set cache version after error:', setError)
      }
    }
  }

  // Run initialization logic when the store is created
  initializeCache()

  return {
    cache,
    set,
    get,
    has,
    remove,
    clearAll,
    clearExpired
  }
})
