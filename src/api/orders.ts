import { apiRequest } from './client'
import type { CreatedOrder, CreateOrderRequest, Order } from './types'

export function createOrder(order: CreateOrderRequest): Promise<CreatedOrder> {
  return apiRequest<CreatedOrder>('/orders', { method: 'POST', body: order })
}

export function getOrder(id: string, signal?: AbortSignal): Promise<Order> {
  return apiRequest<Order>(`/orders/${encodeURIComponent(id)}`, { signal })
}
