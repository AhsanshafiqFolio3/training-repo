import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Star } from 'lucide-react'
import { getProduct } from '../../api/products'
import type { Product } from '../../api/types'
import { AsyncContent } from '../../shared/AsyncContent'
import { BackToTopButton } from '../../shared/BackToTopButton'
import { formatPrice } from '../../shared/formatPrice'
import { ErrorState, LoadingDetails } from '../../shared/StatusViews'
import { useAsync } from '../../shared/useAsync'
import { useCart } from '../cart/useCart'
import { RelatedProducts } from './RelatedProducts'

function ProductDetails({ product }: { product: Product }): ReactElement {
  const { items, dispatch } = useCart()
  const quantityInCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0
  const isSoldOut = product.stock === 0
  const isAtLimit = quantityInCart >= product.stock

  return (
    <div className="product-details-layout">
      <title>{`${product.name} · The Bug Bazaar`}</title>
      <img src={product.imageUrl} alt="" className="product-details-image" />
      <div className="product-details-info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="rating">
          <Star size={14} fill="currentColor" aria-hidden="true" /> {product.rating.toFixed(1)} out
          of 5
        </p>
        <p className="product-details-price">{formatPrice(product.price)}</p>
        <p className="product-stock">{isSoldOut ? 'Out of stock' : `${product.stock} in stock`}</p>
        <button
          type="button"
          className="button dark"
          disabled={isSoldOut || isAtLimit}
          onClick={() => dispatch({ type: 'add', product })}
        >
          {isSoldOut ? 'Sold out' : isAtLimit ? 'All in your cart' : 'Add to cart'}
        </button>
        {quantityInCart > 0 && <p className="in-cart-note">{quantityInCart} in your cart</p>}
      </div>
    </div>
  )
}

export function ProductDetailsPage(): ReactElement {
  const { id = '' } = useParams()
  // A new id gives a new loader. useAsync then aborts the old request, so a slow
  // response for the previous product can never replace the one now on screen.
  const loadProduct = useCallback((signal: AbortSignal) => getProduct(id, signal), [id])
  const [productState, retry] = useAsync(loadProduct)

  return (
    <main className="page-container product-details">
      <Link to="/" className="back-link">
        <ArrowLeft size={15} aria-hidden="true" /> Back to all products
      </Link>
      <AsyncContent
        state={productState}
        loading={<LoadingDetails label="Loading product" />}
        error={(error) =>
          error.httpStatus === 404 ? (
            <ErrorState
              title="We couldn’t find that product."
              message="It may have been removed, or the link is wrong."
            >
              <Link to="/" className="button dark">
                Browse all products
              </Link>
            </ErrorState>
          ) : (
            <ErrorState
              title="We couldn’t load this product."
              message="Something went wrong on our side. Please try again."
              onRetry={retry}
            />
          )
        }
      >
        {(product) => (
          <>
            <ProductDetails product={product} />
            <RelatedProducts category={product.category} currentProductId={product.id} />
          </>
        )}
      </AsyncContent>
      <BackToTopButton />
    </main>
  )
}
