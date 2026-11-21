// A small in-memory cache for GET results, keyed by a string like "products?category=ducks".
// It lives as long as the page does (a reload starts empty).

// How long a result counts as fresh. Product names and prices rarely change, and
// stock is checked again by the server when an order is placed (409), so a minute
// of staleness is safe here.
export const CACHE_TTL_MS = 60_000

type CacheEntry = {
  data: unknown
  savedAt: number
}

const entries = new Map<string, CacheEntry>()

export function readCache<TData>(key: string): TData | undefined {
  const entry = entries.get(key)
  if (!entry || Date.now() - entry.savedAt > CACHE_TTL_MS) return undefined
  // Only useAsync writes here, with the same key and type it reads back.
  return entry.data as TData
}

export function writeCache(key: string, data: unknown): void {
  entries.set(key, { data, savedAt: Date.now() })
}

// Drops every entry whose key starts with the prefix, e.g. "product" after an order,
// so the next visit fetches fresh stock.
export function invalidateCache(prefix: string): void {
  for (const key of entries.keys()) {
    if (key.startsWith(prefix)) entries.delete(key)
  }
}

export function clearCache(): void {
  entries.clear()
}
