import { apiRequest } from './client'
import type { CreatedOrder, CreateOrderRequest, Order } from './types'

// idempotencyKey: the same key for every retry of the same checkout. If the first
// attempt reached the server but the reply got lost, the retry gets the same order
// back instead of creating (and charging for) a second one.
export function createOrder(
  order: CreateOrderRequest,
  idempotencyKey: string,
): Promise<CreatedOrder> {
  return apiRequest<CreatedOrder>('/orders', {
    method: 'POST',
    body: order,
    headers: { 'Idempotency-Key': idempotencyKey },
  })
}

export function getOrder(id: string, signal?: AbortSignal): Promise<Order> {
  return apiRequest<Order>(`/orders/${encodeURIComponent(id)}`, { signal })
}
