import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Star } from 'lucide-react'
import { getProduct, productCacheKey } from '../../api/products'
import type { Product } from '../../api/types'
import { ApiErrorView } from '../../shared/api-error-view'
import { AsyncContent } from '../../shared/async-content'
import { BackToTopButton } from '../../shared/back-to-top-button'
import { formatPrice } from '../../shared/format-price'
import { LoadingDetails } from '../../shared/status-views'
import { useAsync } from '../../shared/use-async'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { itemAdded } from '../cart/cart-slice'
import { useQuantityInCart } from '../cart/use-quantity-in-cart'
import { LiveStockStatus } from '../stock/live-stock-status'
import { selectStock } from '../stock/stock-slice'
import { useLiveStock } from '../stock/use-live-stock'
import { RelatedProducts } from './related-products'

function ProductDetails({ product }: { product: Product }): ReactElement {
  const dispatch = useAppDispatch()
  const quantityInCart = useQuantityInCart(product.id)
  // Watch this product's stock while its page is open.
  const feedStatus = useLiveStock([product.id])
  const stock = useAppSelector((state) => selectStock(state, product))
  const isSoldOut = stock === 0
  const isAtLimit = quantityInCart >= stock

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
        <p
          key={stock}
          className={`product-stock ${stock !== product.stock ? 'stock-changed' : ''}`}
        >
          {isSoldOut ? 'Out of stock' : `${stock} in stock`}
        </p>
        <LiveStockStatus status={feedStatus} />
        <button
          type="button"
          className="button dark"
          disabled={isSoldOut || isAtLimit}
          onClick={() => dispatch(itemAdded({ ...product, stock }))}
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
  const [productState, retry] = useAsync(loadProduct, productCacheKey(id))

  return (
    <main className="page-container product-details">
      <Link to="/" className="back-link">
        <ArrowLeft size={15} aria-hidden="true" /> Back to all products
      </Link>
      <AsyncContent
        state={productState}
        loading={<LoadingDetails label="Loading product" />}
        error={(error) => (
          <ApiErrorView
            error={error}
            onRetry={retry}
            notFoundTitle="We couldn’t find that product."
          />
        )}
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
