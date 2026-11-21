import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '../../api/types'

export type CartLine = {
  // A copy of the product when it was added, so the cart can show it without a request.
  product: Product
  quantity: number
}

export type CartState = {
  lines: CartLine[]
  // Sent with the order as an Idempotency-Key. It stays the same while the user retries
  // the same cart, and is cleared whenever the cart changes. See D3-2 in docs/decisions.md.
  checkoutKey: string | null
}

const initialState: CartState = { lines: [], checkoutKey: null }

function clampToStock(quantity: number, stock: number): number {
  return Math.max(0, Math.min(Math.floor(quantity), stock))
}

// The only way the cart changes is through these reducers. Redux Toolkit lets them
// "mutate" state: Immer turns that into a new, immutable state object behind the scenes.
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    itemAdded(state, action: PayloadAction<Product>) {
      const product = action.payload
      const line = state.lines.find((candidate) => candidate.product.id === product.id)
      if (!line) {
        if (product.stock > 0) state.lines.push({ product, quantity: 1 })
      } else if (line.quantity < product.stock) {
        line.product = product
        line.quantity += 1
      }
      state.checkoutKey = null
    },

    quantityChanged(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload
      const line = state.lines.find((candidate) => candidate.product.id === productId)
      if (!line) return
      line.quantity = clampToStock(quantity, line.product.stock)
      state.lines = state.lines.filter((candidate) => candidate.quantity > 0)
      state.checkoutKey = null
    },

    itemRemoved(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.product.id !== action.payload)
      state.checkoutKey = null
    },

    // After a 409 the server tells us how many of each product are left.
    stockChecked(state, action: PayloadAction<Record<string, number>>) {
      for (const line of state.lines) {
        const available = action.payload[line.product.id]
        if (available === undefined) continue
        line.product.stock = available
        line.quantity = clampToStock(line.quantity, available)
      }
      state.lines = state.lines.filter((line) => line.quantity > 0)
      state.checkoutKey = null
    },

    checkoutStarted: {
      // Reducers must be pure, so the random key is made here, before the reducer runs.
      prepare: () => ({ payload: crypto.randomUUID() }),
      reducer(state, action: PayloadAction<string>) {
        state.checkoutKey ??= action.payload
      },
    },

    cartCleared() {
      return initialState
    },
  },
})

export const {
  itemAdded,
  quantityChanged,
  itemRemoved,
  stockChecked,
  checkoutStarted,
  cartCleared,
} = cartSlice.actions
export const cartReducer = cartSlice.reducer

// Selectors take the whole Redux state. They're written against { cart } so this file
// doesn't need to import the store (which would be a circular import).
type StateWithCart = { cart: CartState }

export const selectCartLines = (state: StateWithCart): CartLine[] => state.cart.lines
export const selectCheckoutKey = (state: StateWithCart): string | null => state.cart.checkoutKey

// Derived values. createSelector remembers the last result, so the count and total
// are only recalculated when the lines change.
export const selectCartCount = createSelector([selectCartLines], (lines) =>
  lines.reduce((sum, line) => sum + line.quantity, 0),
)

// In cents, like every price in the app.
export const selectCartTotal = createSelector([selectCartLines], (lines) =>
  lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
)

export function selectQuantityInCart(state: StateWithCart, productId: string): number {
  return state.cart.lines.find((line) => line.product.id === productId)?.quantity ?? 0
}
