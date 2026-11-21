import { useCart } from './useCart'

// How many of this product are already in the cart (0 if none).
export function useQuantityInCart(productId: string): number {
  const { items } = useCart()
  return items.find((item) => item.product.id === productId)?.quantity ?? 0
}
