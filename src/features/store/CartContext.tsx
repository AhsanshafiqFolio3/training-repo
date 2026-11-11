import { createContext, useContext, useReducer } from 'react'
import type { Dispatch, ReactElement, ReactNode } from 'react'
import type { CartItem } from '../../shared/types'
import { cartReducer } from './logic'
import type { CartAction } from './logic'

interface CartContextValue {
  items: CartItem[]
  dispatch: Dispatch<CartAction>
}
const CartContext = createContext<CartContextValue | null>(null)
export function CartProvider({ children }: { children: ReactNode }): ReactElement {
  const [items, dispatch] = useReducer(cartReducer, [])
  return <CartContext.Provider value={{ items, dispatch }}>{children}</CartContext.Provider>
}
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart requires CartProvider')
  return context
}
