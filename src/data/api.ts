import { products } from './products'
import { customers } from './customers'
import type { ApiResponse, Customer, DemoMode, Product } from '../shared/types'
import { demoControlsEnabled } from '../shared/demoMode'
import { wait } from '../shared/wait'

async function respond<T>(
  items: readonly T[],
  mode: DemoMode,
  signal?: AbortSignal,
  delay = 450,
): Promise<ApiResponse<T[]>> {
  await wait(mode === 'slow' ? 2200 : delay, signal)
  if (mode === 'error') throw new Error('We couldn’t load this collection. Please try again.')
  const data = mode === 'empty' ? [] : items.map((item) => ({ ...item }))
  return { data, total: data.length }
}
export function getProducts(
  mode: DemoMode = 'success',
  signal?: AbortSignal,
): Promise<ApiResponse<Product[]>> {
  return respond(products, mode, signal)
}
export function getCustomers(
  mode: DemoMode = 'success',
  signal?: AbortSignal,
): Promise<ApiResponse<Customer[]>> {
  return respond(customers, mode, signal)
}
export function customerIds(): string[] {
  return customers.map((customer) => customer.id)
}
export async function getCustomer(
  id: string,
  signal?: AbortSignal,
  mode: DemoMode = 'success',
): Promise<ApiResponse<Customer | null>> {
  const response = await respond(
    customers.filter((customer) => customer.id === id),
    mode,
    signal,
    id === 'c01' && demoControlsEnabled() ? 1100 : 220,
  )
  return { data: response.data[0] ?? null, total: response.total }
}
