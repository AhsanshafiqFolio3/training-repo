import { describe, expect, it } from 'vitest'
import { products } from '../../data/products'
import { calculateTotals, cartReducer, filterProducts, money } from './logic'
import type { Product } from '../../shared/types'

const product = products[0]
function priced(price: number): Product {
  return { ...product, price }
}
describe('cart behavior', () => {
  it('increments quantity in the same row when a product is added twice', () => {
    const first = cartReducer([], { type: 'add', product })
    const next = cartReducer(first, { type: 'add', product })
    expect(next).toHaveLength(1)
    expect(next[0].quantity).toBe(2)
    expect(first[0].quantity).toBe(1)
  })
  it('keeps different products in separate rows', () => {
    const first = cartReducer([], { type: 'add', product })
    expect(cartReducer(first, { type: 'add', product: products[1] })).toHaveLength(2)
  })
  it('never adds sold-out products or exceeds stock', () => {
    expect(cartReducer([], { type: 'add', product: { ...product, stock: 0 } })).toEqual([])
    const items = [{ product, quantity: product.stock }]
    expect(cartReducer(items, { type: 'add', product })).toBe(items)
  })
  it('decrements and removes at zero while preserving unrelated rows', () => {
    const items = [
      { product, quantity: 2 },
      { product: products[1], quantity: 1 },
    ]
    const once = cartReducer(items, { type: 'decrement', id: product.id })
    expect(once[0].quantity).toBe(1)
    expect(cartReducer(once, { type: 'decrement', id: product.id })).toEqual([items[1]])
  })
  it('supports explicit remove and clear', () => {
    const items = [{ product, quantity: 3 }]
    expect(cartReducer(items, { type: 'remove', id: product.id })).toEqual([])
    expect(cartReducer(items, { type: 'clear' })).toEqual([])
  })
})
describe('pricing', () => {
  it('returns zero totals for an empty bag', () =>
    expect(calculateTotals([])).toEqual({ count: 0, subtotal: 0, discount: 0, total: 0 }))
  it.each([
    [4999, 0, 4999],
    [5000, 0, 5000],
    [5001, 500.1, 4500.9],
    [5000.01, 500, 4500.01],
    [10000, 1000, 9000],
  ])(
    'prices a subtotal of %s with a strict threshold and two-decimal rounding',
    (price, discount, total) => {
      expect(calculateTotals([{ product: priced(price), quantity: 1 }])).toEqual({
        count: 1,
        subtotal: price,
        discount,
        total,
      })
    },
  )
  it('counts units rather than rows and discounts the complete subtotal', () => {
    expect(
      calculateTotals([
        { product: priced(2000), quantity: 3 },
        { product: priced(1000), quantity: 1 },
      ]),
    ).toEqual({ count: 4, subtotal: 7000, discount: 700, total: 6300 })
  })
  it('handles fractional currency without binary floating-point residue', () => {
    expect(calculateTotals([{ product: priced(0.1), quantity: 3 }]).subtotal).toBe(0.3)
    expect(money(4500.9)).toBe('Rs. 4,500.90')
  })
})
describe('product filtering', () => {
  it('has 20 uniquely identified products across four categories', () => {
    expect(products).toHaveLength(20)
    expect(new Set(products.map((p) => p.id)).size).toBe(20)
    expect(new Set(products.map((p) => p.category)).size).toBe(4)
  })
  it('combines trimmed case-insensitive search, category and stock', () => {
    const result = filterProducts(products, {
      search: '  PEBBLE  ',
      category: 'Audio',
      inStock: true,
    })
    expect(result.map((p) => p.id)).toEqual(['p02'])
  })
  it('returns no results for mismatched category and does not mutate source data', () => {
    expect(
      filterProducts(products, { search: 'Studio', category: 'Wearables', inStock: false }),
    ).toEqual([])
    expect(products).toHaveLength(20)
  })
})
