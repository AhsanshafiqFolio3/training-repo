import { useAppSelector } from '../../store/hooks'
import { selectQuantityInCart } from './cart-slice'

// How many of this product are already in the cart (0 if none).
export function useQuantityInCart(productId: string): number {
  return useAppSelector((state) => selectQuantityInCart(state, productId))
}
