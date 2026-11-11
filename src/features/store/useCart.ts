import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { CartItem } from '../../shared/types'
import type { CartAction } from './logic'

export interface CartContextValue {
  items: CartItem[]
  dispatch: Dispatch<CartAction>
}
export const CartContext = createContext<CartContextValue | null>(null)
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart requires CartProvider')
  return context
}
