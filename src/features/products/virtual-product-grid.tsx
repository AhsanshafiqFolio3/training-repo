import { useCallback, useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import type { Product } from '../../api/types'
import { targetIndexForKey } from './grid-navigation'
import { ProductCard } from './product-card'
import { useVirtualRows } from './use-virtual-rows'

type VirtualProductGridProps = {
  products: Product[]
  label: string
}

// The shop's grid. With thousands of products loaded, only the rows near the screen
// are in the DOM (about 30 cards), so scrolling, adding to the cart and loading the
// next page stay fast however long the list gets. See docs/performance.md.
export function VirtualProductGrid({ products, label }: VirtualProductGridProps): ReactElement {
  const listRef = useRef<HTMLUListElement>(null)
  const { firstIndex, lastIndex, paddingTop, paddingBottom, columns, scrollToIndex } =
    useVirtualRows(listRef, products.length)
  const drawn = products.slice(firstIndex, lastIndex)

  // A card the keyboard wants to move to, but that isn't drawn yet.
  const pendingFocusRef = useRef<number | null>(null)

  // After each render, focus the waiting card if it has been drawn now.
  useLayoutEffect(() => {
    const index = pendingFocusRef.current
    if (index === null) return
    const link = listRef.current?.querySelector<HTMLElement>(`[data-grid-index="${index}"]`)
    if (link) {
      pendingFocusRef.current = null
      link.focus()
    }
  })

  // The key handler below reads these through a ref, so the handler itself never
  // changes. A new handler would be a new prop for every card and undo ProductCard's memo.
  const latestRef = useRef({ columns, count: products.length, scrollToIndex })
  useLayoutEffect(() => {
    latestRef.current = { columns, count: products.length, scrollToIndex }
  })

  // Same keys as the plain grid. The difference: the target card may not be drawn
  // (End from the top of a long list), so we scroll to it and focus it once it is.
  const moveGridFocus = useCallback((event: KeyboardEvent<HTMLAnchorElement>) => {
    const { columns: columnCount, count, scrollToIndex: scrollTo } = latestRef.current
    const index = Number(event.currentTarget.dataset.gridIndex)
    const target = targetIndexForKey(event.key, index, columnCount, count)
    if (target === undefined) return
    event.preventDefault()

    const link = listRef.current?.querySelector<HTMLElement>(`[data-grid-index="${target}"]`)
    if (link) {
      link.focus()
    } else {
      pendingFocusRef.current = target
      scrollTo(target)
    }
  }, [])

  return (
    <ul
      ref={listRef}
      className="product-grid"
      aria-label={label}
      style={{ paddingTop, paddingBottom }}
    >
      {drawn.map((product, offset) => {
        const index = firstIndex + offset
        return (
          // Screen readers only see the drawn cards, so tell them where each one sits
          // in the full list ("product 120 of 2,400").
          <li key={product.id} aria-posinset={index + 1} aria-setsize={products.length}>
            <ProductCard product={product} index={index} onLinkKeyDown={moveGridFocus} />
          </li>
        )
      })}
    </ul>
  )
}
