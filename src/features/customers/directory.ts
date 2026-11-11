import type { Customer } from '../../shared/types'

export function mergeCustomers(
  loaded: readonly Customer[],
  added: readonly Customer[],
): Customer[] {
  const known = new Set(loaded.map((customer) => customer.id))
  return [...loaded, ...added.filter((customer) => !known.has(customer.id))]
}
export function nextCustomerId(order: readonly string[], id: string): string | null {
  if (order.length === 0) return null
  return order[(order.indexOf(id) + 1) % order.length]
}
