import { useMemo, useReducer } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { cartReducer } from './cart-logic'
import { CartContext } from './use-cart'

export function CartProvider({ children }: { children: ReactNode }): ReactElement {
  const [items, dispatch] = useReducer(cartReducer, [])
  const value = useMemo(() => ({ items, dispatch }), [items])
  return <CartContext value={value}>{children}</CartContext>
}
