import type { LiveSocket } from '../api/client'
import type { StockSubscribeMessage, StockUpdate, StockUpdateMessage } from '../api/types'
import { findProduct } from './mock-database'
import { latencyMs, readMockSettings } from './mock-settings'

// A pretend WebSocket server for /api/stock. While at least one socket is open, every
// few seconds "another shopper" buys or restocks one of the products someone watches,
// and every socket watching it hears about it. When the last socket closes, the timer stops.

const CHANGE_EVERY_MS = 2500

const openSockets = new Set<MockStockSocket>()
let changeTimer: ReturnType<typeof setInterval> | undefined

function isSubscribeMessage(value: unknown): value is StockSubscribeMessage {
  if (typeof value !== 'object' || value === null) return false
  const productIds: unknown = Reflect.get(value, 'productIds')
  return (
    Reflect.get(value, 'type') === 'subscribe' &&
    Array.isArray(productIds) &&
    productIds.every((id) => typeof id === 'string')
  )
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

// Change one watched product's stock and tell everyone watching it.
function changeSomeStock(): void {
  const watched = [...new Set([...openSockets].flatMap((socket) => socket.watching))]
  const product = findProduct(watched[randomInt(0, watched.length - 1)] ?? '')
  if (!product) return

  // Mostly sales of one to three units; sometimes a restock, always one when sold out.
  const isRestock = product.stock === 0 || Math.random() < 0.2
  setMockStock(
    product.id,
    isRestock ? product.stock + randomInt(5, 20) : Math.max(0, product.stock - randomInt(1, 3)),
  )
}

// Sets a product's stock and tells every socket watching it. Tests use it to make
// a change happen exactly when they want.
export function setMockStock(productId: string, stock: number): void {
  const product = findProduct(productId)
  if (!product) return
  product.stock = stock
  for (const socket of openSockets) {
    if (socket.watching.includes(productId)) socket.deliver([{ productId, stock }])
  }
}

function startChanging(): void {
  changeTimer ??= setInterval(changeSomeStock, CHANGE_EVERY_MS)
}

function stopChangingIfIdle(): void {
  if (openSockets.size > 0 || changeTimer === undefined) return
  clearInterval(changeTimer)
  changeTimer = undefined
}

// Extends EventTarget like a real WebSocket, so the app listens with addEventListener
// and can't tell the two apart.
export class MockStockSocket extends EventTarget implements LiveSocket {
  watching: string[] = []
  private isOpen = false
  private isClosed = false
  private readonly connectTimer: ReturnType<typeof setTimeout>

  constructor(path: string) {
    super()
    // Connecting takes as long as a normal request would.
    this.connectTimer = setTimeout(() => {
      if (path !== '/api/stock' || readMockSettings().stockFeedDown) {
        // 1006 is what a browser reports when the connection failed or was cut.
        this.finish(1006)
        return
      }
      this.isOpen = true
      openSockets.add(this)
      startChanging()
      this.dispatchEvent(new Event('open'))
    }, latencyMs(readMockSettings().latency))
  }

  send(data: string): void {
    if (!this.isOpen) throw new DOMException('The socket is not open.', 'InvalidStateError')
    const message: unknown = JSON.parse(data)
    if (!isSubscribeMessage(message)) return
    this.watching = message.productIds
    // Catch the client up on the current stock of everything it now watches.
    const current = this.watching.flatMap((productId) => {
      const product = findProduct(productId)
      return product ? [{ productId, stock: product.stock }] : []
    })
    if (current.length > 0) this.deliver(current)
  }

  // The client closing the socket (1000 means "normal closure").
  close(): void {
    clearTimeout(this.connectTimer)
    this.finish(1000)
  }

  // The "server" cutting the connection, as if the network dropped.
  drop(): void {
    this.finish(1006)
  }

  deliver(updates: StockUpdate[]): void {
    if (!this.isOpen) return
    const message: StockUpdateMessage = { type: 'stock', updates }
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(message) }))
  }

  private finish(code: number): void {
    if (this.isClosed) return
    this.isClosed = true
    this.isOpen = false
    openSockets.delete(this)
    stopChangingIfIdle()
    // A real socket reports the close a moment later, never inside close() itself.
    setTimeout(() => this.dispatchEvent(new CloseEvent('close', { code, wasClean: code === 1000 })))
  }
}

// Used by the "live stock server down" switch.
export function dropStockSockets(): void {
  for (const socket of openSockets) socket.drop()
}

// For tests: how many sockets are open, and whether the change timer is running.
export function mockStockServerState(): { openSockets: number; isChanging: boolean } {
  return { openSockets: openSockets.size, isChanging: changeTimer !== undefined }
}
