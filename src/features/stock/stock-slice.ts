import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Product, StockUpdate } from '../../api/types'
import type { RootState } from '../../store/store'

// Live stock levels from the WebSocket feed, by product id. They are newer than the
// stock in the product data we fetched, so wherever stock is shown, this wins.
export type StockState = Record<string, number>

const initialState: StockState = {}

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    stockUpdated(state, action: PayloadAction<StockUpdate[]>) {
      for (const { productId, stock } of action.payload) state[productId] = stock
    },
    // After an order the product data is fetched again, fresh from the server,
    // so the live values we heard before the order are older than that. Forget them.
    stockReset() {
      return initialState
    },
  },
})

export const { stockUpdated, stockReset } = stockSlice.actions
export const stockReducer = stockSlice.reducer

// The stock to show for a product: the live value if we have one, else the fetched one.
// It returns a number, so a card only renders again when its own stock changes,
// not when any other product's stock does.
export function selectStock(state: RootState, product: Product): number {
  return state.stock[product.id] ?? product.stock
}
