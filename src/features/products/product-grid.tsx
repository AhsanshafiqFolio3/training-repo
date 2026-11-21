import type { KeyboardEvent, ReactElement } from 'react'
import type { Product } from '../../api/types'
import { countColumns, targetIndexForKey } from './grid-navigation'
import { ProductCard } from './product-card'

type ProductGridProps = {
  products: Product[]
  label: string
}

// Tab moves through every link and button as usual. On top of that, arrow keys
// jump between product links (see grid-navigation.ts).
function moveGridFocus(event: KeyboardEvent<HTMLAnchorElement>): void {
  const grid = event.currentTarget.closest('ul')
  if (!grid) return

  const links = grid.querySelectorAll<HTMLElement>('[data-grid-index]')
  const index = Number(event.currentTarget.dataset.gridIndex)
  const target = targetIndexForKey(event.key, index, countColumns(grid), links.length)
  if (target === undefined) return

  event.preventDefault()
  links[target]?.focus()
}

// A plain grid that renders every product. Fine for a handful of cards, such as
// related products. The shop uses VirtualProductGrid, which renders only what's on screen.
export function ProductGrid({ products, label }: ProductGridProps): ReactElement {
  return (
    <ul className="product-grid" aria-label={label}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} index={index} onLinkKeyDown={moveGridFocus} />
        </li>
      ))}
    </ul>
  )
}
