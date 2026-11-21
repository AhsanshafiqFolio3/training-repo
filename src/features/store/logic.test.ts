import { describe, expect, it } from 'vitest'
import type { Product } from '../../api/types'
import { calculateTotals, cartReducer } from './logic'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-0001',
    name: 'Classic Debugging Rubber Duck',
    price: 999,
    category: 'ducks',
    stock: 3,
    rating: 4.5,
    imageUrl: '/images/products/ducks.svg',
    ...overrides,
  }
}

describe('cart reducer', () => {
  it('adds the same product into one row and counts up', () => {
    const duck = makeProduct()
    const once = cartReducer([], { type: 'add', product: duck })
    const twice = cartReducer(once, { type: 'add', product: duck })
    expect(twice).toEqual([{ product: duck, quantity: 2 }])
    // The earlier state is left untouched.
    expect(once).toEqual([{ product: duck, quantity: 1 }])
  })

  it('never adds more than the stock, or anything that is sold out', () => {
    const duck = makeProduct({ stock: 1 })
    const full = cartReducer([], { type: 'add', product: duck })
    expect(cartReducer(full, { type: 'add', product: duck })).toBe(full)
    expect(cartReducer([], { type: 'add', product: makeProduct({ stock: 0 }) })).toEqual([])
  })

  it('removes a row when decreasing from one, and keeps other rows', () => {
    const duck = makeProduct()
    const coffee = makeProduct({ id: 'prod-0002', category: 'coffee' })
    const items = [
      { product: duck, quantity: 1 },
      { product: coffee, quantity: 2 },
    ]
    expect(cartReducer(items, { type: 'decrement', id: duck.id })).toEqual([
      { product: coffee, quantity: 2 },
    ])
    expect(cartReducer(items, { type: 'remove', id: coffee.id })).toEqual([
      { product: duck, quantity: 1 },
    ])
    expect(cartReducer(items, { type: 'clear' })).toEqual([])
  })
})

describe('cart totals', () => {
  it('adds up units and cents without rounding errors', () => {
    const items = [
      { product: makeProduct({ price: 10 }), quantity: 1 },
      { product: makeProduct({ id: 'prod-0002', price: 20 }), quantity: 1 },
    ]
    // 0.10 + 0.20 is 0.30000000000000004 in floats, but 10 + 20 cents is exactly 30.
    expect(calculateTotals(items)).toEqual({ count: 2, total: 30 })
  })
})
