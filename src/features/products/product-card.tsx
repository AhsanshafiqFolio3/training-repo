import { memo } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import { Link } from 'react-router'
import { Check, Plus, Star } from 'lucide-react'
import type { Product } from '../../api/types'
import { formatPrice } from '../../shared/format-price'
import { useAppDispatch } from '../../store/hooks'
import { itemAdded } from '../cart/cart-slice'
import { useQuantityInCart } from '../cart/use-quantity-in-cart'

type ProductCardProps = {
  product: Product
  index: number
  onLinkKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => void
}

function addButtonLabel(isSoldOut: boolean, isAtLimit: boolean, quantity: number): string {
  if (isSoldOut) return 'Sold out'
  if (isAtLimit) return 'Max added'
  return quantity > 0 ? `Add (${quantity})` : 'Add'
}

// memo: when the list gets a new page or the cart changes, only cards whose props
// changed render again. The product objects, index and key handler stay the same for
// cards that were already on screen, so those are skipped (see docs/performance.md).
export const ProductCard = memo(function ProductCard({
  product,
  index,
  onLinkKeyDown,
}: ProductCardProps): ReactElement {
  const dispatch = useAppDispatch()
  const quantityInCart = useQuantityInCart(product.id)
  const isSoldOut = product.stock === 0
  const isAtLimit = quantityInCart >= product.stock

  return (
    <article className="product-card">
      <div className="product-image">
        {isSoldOut && (
          <div className="product-badges">
            <span className="badge badge-sold">Sold out</span>
          </div>
        )}
        <img src={product.imageUrl} alt="" loading="lazy" />
      </div>
      <div className="product-meta">
        <span>{product.category}</span>
        <span className="rating" aria-label={`Rated ${product.rating.toFixed(1)} out of 5`}>
          <Star size={11} fill="currentColor" aria-hidden="true" />
          {product.rating.toFixed(1)}
        </span>
      </div>
      <h3>
        {/* data-grid-index lets the grid move focus between cards with arrow keys. */}
        <Link
          to={`/products/${product.id}`}
          className="product-link"
          data-grid-index={index}
          onKeyDown={onLinkKeyDown}
        >
          {product.name}
        </Link>
      </h3>
      <p className="product-stock">{isSoldOut ? 'Out of stock' : `${product.stock} in stock`}</p>
      <div className="product-bottom">
        <strong>{formatPrice(product.price)}</strong>
        <button
          className={`add-button ${quantityInCart > 0 ? 'added' : ''}`}
          disabled={isSoldOut || isAtLimit}
          onClick={() => dispatch(itemAdded(product))}
          aria-label={`Add ${product.name} to cart`}
        >
          {quantityInCart > 0 && !isAtLimit ? <Check size={14} /> : <Plus size={14} />}{' '}
          {addButtonLabel(isSoldOut, isAtLimit, quantityInCart)}
        </button>
      </div>
    </article>
  )
})
