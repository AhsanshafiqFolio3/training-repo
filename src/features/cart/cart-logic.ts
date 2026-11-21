import type { Product } from '../../api/types'

export type CartItem = {
  product: Product
  quantity: number
}

export type CartTotals = {
  count: number
  // In cents, like every price in the app.
  total: number
}

export type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'decrement'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'clear':
      return []
    case 'remove':
      return items.filter((item) => item.product.id !== action.id)
    case 'decrement':
      return items.flatMap((item) => {
        if (item.product.id !== action.id) return [item]
        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []
      })
    case 'add': {
      const existing = items.find((item) => item.product.id === action.product.id)
      // Never put more in the cart than is in stock.
      if ((existing?.quantity ?? 0) >= action.product.stock) return items
      if (!existing) return [...items, { product: action.product, quantity: 1 }]
      return items.map((item) =>
        item === existing ? { ...item, quantity: item.quantity + 1 } : item,
      )
    }
  }
}

export function calculateTotals(items: readonly CartItem[]): CartTotals {
  return {
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  }
}
