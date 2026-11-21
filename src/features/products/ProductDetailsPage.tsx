import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Star } from 'lucide-react'
import { getProduct } from '../../api/products'
import { EmptyState } from '../../shared/Feedback'
import { formatPrice } from '../../shared/formatPrice'
import { useAsync } from '../../shared/useAsync'
import { useCart } from '../cart/useCart'

export function ProductDetailsPage(): ReactElement {
  const { id = '' } = useParams()
  const loadProduct = useCallback((signal: AbortSignal) => getProduct(id, signal), [id])
  const [productState, retry] = useAsync(loadProduct)
  const { items, dispatch } = useCart()

  if (productState.status === 'loading' || productState.status === 'idle') {
    return <main className="page-container" aria-busy="true" />
  }
  if (productState.status === 'error') {
    return (
      <main className="page-container">
        <EmptyState
          title="We couldn’t load this product."
          message="Something went wrong on our side. Please try again."
          error
          action={retry}
        />
      </main>
    )
  }

  const product = productState.data
  const quantityInCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0
  const isSoldOut = product.stock === 0
  const isAtLimit = quantityInCart >= product.stock

  return (
    <main className="page-container product-details">
      <title>{`${product.name} · The Bug Bazaar`}</title>
      <Link to="/" className="back-link">
        <ArrowLeft size={15} /> Back to all products
      </Link>
      <div className="product-details-layout">
        <img src={product.imageUrl} alt="" className="product-details-image" />
        <div className="product-details-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="rating">
            <Star size={14} fill="currentColor" aria-hidden="true" /> {product.rating.toFixed(1)}{' '}
            out of 5
          </p>
          <p className="product-details-price">{formatPrice(product.price)}</p>
          <p className="product-stock">
            {isSoldOut ? 'Out of stock' : `${product.stock} in stock`}
          </p>
          <button
            className="button dark"
            disabled={isSoldOut || isAtLimit}
            onClick={() => dispatch({ type: 'add', product })}
          >
            {isSoldOut ? 'Sold out' : isAtLimit ? 'All in your cart' : 'Add to cart'}
          </button>
          {quantityInCart > 0 && <p className="in-cart-note">{quantityInCart} in your cart</p>}
        </div>
      </div>
    </main>
  )
}
