import type { CreatedOrder, Order, OrderLine, OrderStatus } from '../../api/types'
import { findProduct, mockDatabase } from '../mock-database'
import type { StoredOrder } from '../mock-database'
import { errorResponse, jsonResponse } from '../mock-responses'
import type { MockRequest } from '../mock-request'
import { authenticate } from './auth-handlers'

// Pretend the order moves through a queue: queued, then processing, then shipped.
function statusFor(order: StoredOrder): OrderStatus {
  const ageMs = Date.now() - order.createdAt
  if (ageMs < 5_000) return 'queued'
  if (ageMs < 15_000) return 'processing'
  return 'shipped'
}

function isOrderLine(value: unknown): value is OrderLine {
  if (typeof value !== 'object' || value === null) return false
  const productId: unknown = Reflect.get(value, 'productId')
  const quantity: unknown = Reflect.get(value, 'quantity')
  return typeof productId === 'string' && Number.isInteger(quantity) && Number(quantity) > 0
}

function readOrderLines(body: unknown): OrderLine[] | null {
  if (typeof body !== 'object' || body === null) return null
  const items: unknown = Reflect.get(body, 'items')
  if (!Array.isArray(items) || items.length === 0) return null
  return items.every(isOrderLine) ? items : null
}

// POST /api/orders
export function createOrder(request: MockRequest): Response {
  const user = authenticate(request)
  if (user instanceof Response) return user

  const lines = readOrderLines(request.body)
  if (!lines) {
    return errorResponse(400, 'VALIDATION_ERROR', 'The order needs at least one valid item.', {
      items: 'Each item needs a productId and a whole-number quantity above 0.',
    })
  }

  const unknownIds = lines.filter((line) => !findProduct(line.productId))
  if (unknownIds.length > 0) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Some products do not exist.', {
      items: `Unknown product: ${unknownIds.map((line) => line.productId).join(', ')}`,
    })
  }

  // 409: details maps each product that ran short to how many are left.
  const shortages: Record<string, string> = {}
  for (const line of lines) {
    const available = findProduct(line.productId)?.stock ?? 0
    if (line.quantity > available) shortages[line.productId] = String(available)
  }
  if (Object.keys(shortages).length > 0) {
    return errorResponse(409, 'OUT_OF_STOCK', 'Some items are out of stock.', shortages)
  }

  for (const line of lines) {
    const product = findProduct(line.productId)
    if (product) product.stock -= line.quantity
  }

  const order: StoredOrder = {
    id: `order-${mockDatabase.orders.length + 1}`,
    userId: user.id,
    items: lines,
    createdAt: Date.now(),
  }
  mockDatabase.orders.push(order)

  const body: CreatedOrder = { id: order.id, status: 'queued' }
  return jsonResponse(201, body)
}

// GET /api/orders/:id
export function getOrder(request: MockRequest): Response {
  const user = authenticate(request)
  if (user instanceof Response) return user

  // Someone else's order is reported as missing, so ids can't be probed.
  const order = mockDatabase.orders.find(
    (candidate) => candidate.id === request.params.id && candidate.userId === user.id,
  )
  if (!order) return errorResponse(404, 'ORDER_NOT_FOUND', 'No order has that id.')

  const body: Order = { id: order.id, status: statusFor(order) }
  return jsonResponse(200, body)
}
