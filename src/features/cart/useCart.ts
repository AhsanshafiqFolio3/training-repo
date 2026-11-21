import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { CartAction, CartItem } from './cartLogic'

export type CartContextValue = {
  items: CartItem[]
  dispatch: Dispatch<CartAction>
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
