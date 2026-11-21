import { products } from './products'
import type { ApiResponse, DemoMode, Product } from '../shared/types'
import { wait } from '../shared/wait'

async function respond<T>(
  items: readonly T[],
  mode: DemoMode,
  signal?: AbortSignal,
  delay = 450,
): Promise<ApiResponse<T[]>> {
  await wait(mode === 'slow' ? 2200 : delay, signal)
  if (mode === 'error') throw new Error('We couldn’t load the products. Please try again.')
  const data = mode === 'empty' ? [] : items.map((item) => ({ ...item }))
  return { data, total: data.length }
}
export function getProducts(
  mode: DemoMode = 'success',
  signal?: AbortSignal,
): Promise<ApiResponse<Product[]>> {
  return respond(products, mode, signal)
}
