import type { KeyboardEvent, ReactElement } from 'react'
import type { Product } from '../../api/types'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  products: Product[]
  label: string
}

// How many cards fit in one row right now (it changes with screen width).
function countColumns(grid: HTMLElement): number {
  return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1
}

// Tab moves through every link and button as usual. On top of that, arrow keys
// jump between product links like a spreadsheet: left/right by one, up/down by a row.
function moveGridFocus(event: KeyboardEvent<HTMLAnchorElement>): void {
  const current = event.currentTarget
  const grid = current.closest('ul')
  if (!grid) return

  const links = Array.from(grid.querySelectorAll<HTMLElement>('[data-grid-index]'))
  const index = Number(current.dataset.gridIndex)
  const columns = countColumns(grid)

  const targetIndexByKey: Record<string, number> = {
    ArrowRight: index + 1,
    ArrowLeft: index - 1,
    ArrowDown: index + columns,
    ArrowUp: index - columns,
    Home: 0,
    End: links.length - 1,
  }
  const targetIndex = targetIndexByKey[event.key]
  if (targetIndex === undefined) return

  const target = links[targetIndex]
  if (target) {
    event.preventDefault()
    target.focus()
  }
}

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
