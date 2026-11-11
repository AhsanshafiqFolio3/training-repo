import { products } from './products'
import { customers } from './customers'
import type { ApiResponse, Customer, DemoMode, Product } from '../shared/types'

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const onAbort = (): void => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
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
export async function getCustomer(
  id: string,
  signal?: AbortSignal,
  mode: DemoMode = 'success',
): Promise<ApiResponse<Customer | null>> {
  const response = await respond(
    customers.filter((customer) => customer.id === id),
    mode,
    signal,
    id === 'c01' ? 1100 : 220,
  )
  return { data: response.data[0] ?? null, total: response.total }
}
