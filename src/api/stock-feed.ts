import { openSocket } from './client'
import type { LiveSocket } from './client'
import type { StockUpdate, StockUpdateMessage } from './types'

// The live stock feed: one WebSocket to /api/stock that reconnects by itself.

export type FeedStatus = 'connecting' | 'live' | 'reconnecting'

type StockFeedOptions = {
  onUpdates: (updates: StockUpdate[]) => void
  onStatus: (status: FeedStatus) => void
}

export type StockFeed = {
  // Replaces the list of products to hear about.
  watch: (productIds: string[]) => void
  // Stops for good: closes the socket and cancels any planned reconnect.
  close: () => void
}

const FIRST_RETRY_MS = 1000
const MAX_RETRY_MS = 15_000

// Exponential backoff with jitter: about 1 s, 2 s, 4 s, 8 s, then every 15 s at most.
// The random half spreads clients out, so after a server restart they don't all
// reconnect in the same millisecond.
export function retryDelay(failedAttempts: number, random: () => number = Math.random): number {
  const ceiling = Math.min(MAX_RETRY_MS, FIRST_RETRY_MS * 2 ** failedAttempts)
  return ceiling / 2 + random() * (ceiling / 2)
}

function isStockUpdate(value: unknown): value is StockUpdate {
  if (typeof value !== 'object' || value === null) return false
  return (
    typeof Reflect.get(value, 'productId') === 'string' &&
    Number.isInteger(Reflect.get(value, 'stock'))
  )
}

// Socket messages are checked, unlike HTTP replies: a bad one is skipped instead of
// breaking every card on the page.
export function readStockMessage(data: unknown): StockUpdateMessage | null {
  if (typeof data !== 'string') return null
  try {
    const message: unknown = JSON.parse(data)
    if (typeof message !== 'object' || message === null) return null
    const updates: unknown = Reflect.get(message, 'updates')
    if (Reflect.get(message, 'type') !== 'stock' || !Array.isArray(updates)) return null
    return { type: 'stock', updates: updates.filter(isStockUpdate) }
  } catch {
    return null
  }
}

type Connection = {
  socket: LiveSocket
  // Aborting it removes every listener we added to this socket in one go.
  listeners: AbortController
  isOpen: boolean
}

export function openStockFeed({ onUpdates, onStatus }: StockFeedOptions): StockFeed {
  let productIds: string[] = []
  let connection: Connection | null = null
  let failedAttempts = 0
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  function subscribe(): void {
    if (connection?.isOpen) {
      connection.socket.send(JSON.stringify({ type: 'subscribe', productIds }))
    }
  }

  function connect(): void {
    const current: Connection = {
      socket: openSocket('/stock'),
      listeners: new AbortController(),
      isOpen: false,
    }
    connection = current
    const { socket, listeners } = current

    socket.addEventListener(
      'open',
      () => {
        current.isOpen = true
        failedAttempts = 0
        onStatus('live')
        // Also on every reconnect, so the server knows what we watch and catches us up.
        subscribe()
      },
      { signal: listeners.signal },
    )
    socket.addEventListener(
      'message',
      (event) => {
        const message = event instanceof MessageEvent ? readStockMessage(event.data) : null
        if (message && message.updates.length > 0) onUpdates(message.updates)
      },
      { signal: listeners.signal },
    )
    // The connection failed or dropped: try again after a growing delay.
    socket.addEventListener(
      'close',
      () => {
        connection = null
        onStatus('reconnecting')
        retryTimer = setTimeout(connect, retryDelay(failedAttempts))
        failedAttempts += 1
      },
      { signal: listeners.signal },
    )
  }

  onStatus('connecting')
  connect()

  return {
    watch(nextProductIds) {
      productIds = nextProductIds
      subscribe()
    },
    close() {
      clearTimeout(retryTimer)
      if (!connection) return
      // Remove our listeners first, so this close doesn't count as a drop to recover from.
      connection.listeners.abort()
      connection.socket.close()
      connection = null
    },
  }
}
