import { describe, expect, it } from 'vitest'
import type { Product } from '../../api/types'
import { createAppStore } from '../../store/store'
import {
  checkoutStarted,
  itemAdded,
  itemRemoved,
  quantityChanged,
  selectCartCount,
  selectCartTotal,
  selectQuantityInCart,
  stockChecked,
} from './cart-slice'

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

describe('cart slice', () => {
  it('adds the same product into one line and never past its stock', () => {
    const store = createAppStore()
    const duck = makeProduct({ stock: 2 })
    store.dispatch(itemAdded(duck))
    store.dispatch(itemAdded(duck))
    store.dispatch(itemAdded(duck))

    expect(store.getState().cart.lines).toEqual([{ product: duck, quantity: 2 }])
    store.dispatch(itemAdded(makeProduct({ id: 'prod-0002', stock: 0 })))
    expect(store.getState().cart.lines).toHaveLength(1)
  })

  it('clamps typed quantities to the stock and removes a line at zero', () => {
    const store = createAppStore()
    store.dispatch(itemAdded(makeProduct({ stock: 5 })))

    store.dispatch(quantityChanged({ productId: 'prod-0001', quantity: 99 }))
    expect(selectQuantityInCart(store.getState(), 'prod-0001')).toBe(5)

    store.dispatch(quantityChanged({ productId: 'prod-0001', quantity: 0 }))
    expect(store.getState().cart.lines).toEqual([])
  })

  it('derives the item count and total (in cents) from the lines', () => {
    const store = createAppStore()
    const duck = makeProduct({ price: 999 })
    const coffee = makeProduct({ id: 'prod-0002', price: 1500, category: 'coffee' })
    store.dispatch(itemAdded(duck))
    store.dispatch(itemAdded(duck))
    store.dispatch(itemAdded(coffee))

    expect(selectCartCount(store.getState())).toBe(3)
    expect(selectCartTotal(store.getState())).toBe(999 * 2 + 1500)

    store.dispatch(itemRemoved('prod-0001'))
    expect(selectCartCount(store.getState())).toBe(1)
  })

  it('applies stock from a 409: lowers quantities and drops sold-out lines', () => {
    const store = createAppStore()
    const duck = makeProduct({ stock: 5 })
    const coffee = makeProduct({ id: 'prod-0002', stock: 5 })
    store.dispatch(itemAdded(duck))
    store.dispatch(quantityChanged({ productId: duck.id, quantity: 4 }))
    store.dispatch(itemAdded(coffee))

    store.dispatch(stockChecked({ [duck.id]: 2, [coffee.id]: 0 }))
    expect(store.getState().cart.lines).toEqual([{ product: { ...duck, stock: 2 }, quantity: 2 }])
  })

  it('keeps one checkout key while retrying, and a new one once the cart changes', () => {
    const store = createAppStore()
    store.dispatch(itemAdded(makeProduct()))
    store.dispatch(checkoutStarted())
    const firstKey = store.getState().cart.checkoutKey
    store.dispatch(checkoutStarted())
    expect(store.getState().cart.checkoutKey).toBe(firstKey)

    store.dispatch(itemAdded(makeProduct()))
    expect(store.getState().cart.checkoutKey).toBeNull()
  })
})
