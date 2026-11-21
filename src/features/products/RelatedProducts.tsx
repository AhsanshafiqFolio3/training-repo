import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { getProducts } from '../../api/products'
import type { Category } from '../../api/types'
import { AsyncContent } from '../../shared/AsyncContent'
import { ErrorState, LoadingGrid } from '../../shared/StatusViews'
import { useAsync } from '../../shared/useAsync'
import { ProductGrid } from './ProductGrid'

const RELATED_COUNT = 6

type RelatedProductsProps = {
  category: Category
  currentProductId: string
}

export function RelatedProducts({
  category,
  currentProductId,
}: RelatedProductsProps): ReactElement {
  const loadRelated = useCallback(
    (signal: AbortSignal) => getProducts({ category, inStock: true, sort: 'rating' }, signal),
    [category],
  )
  const [relatedState, retry] = useAsync(loadRelated)

  return (
    <section className="related-products" aria-labelledby="related-heading">
      <h2 id="related-heading">More from this category</h2>
      <AsyncContent
        state={relatedState}
        loading={<LoadingGrid label="Loading related products" />}
        error={() => (
          <ErrorState
            title="We couldn’t load related products."
            message="Please try again."
            onRetry={retry}
          />
        )}
      >
        {(data) => (
          <ProductGrid
            label="Related products"
            products={data.items
              .filter((product) => product.id !== currentProductId)
              .slice(0, RELATED_COUNT)}
          />
        )}
      </AsyncContent>
    </section>
  )
}
