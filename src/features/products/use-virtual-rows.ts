import { useCallback, useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import { useEventListener } from '../../shared/use-event-listener'
import { countColumns } from './grid-navigation'

// Rows drawn above and below the screen, so a fast scroll or an arrow key
// never lands on a row that isn't there yet.
const OVERSCAN_ROWS = 3
// Before the first measurement we don't know the row height, so draw two pages' worth.
const ITEMS_BEFORE_MEASURING = 48

type RowSize = {
  columns: number
  // One card's height plus the gap below it, in pixels.
  rowHeight: number
}

export type RowRange = {
  first: number
  // Exclusive, like Array.slice: rows first..last-1 are drawn.
  last: number
}

// Pure maths, so it's easy to test. `scrolledPast` is how far the top of the list
// is above the top of the screen (negative while the list is still below it).
export function visibleRows(
  scrolledPast: number,
  screenHeight: number,
  rowHeight: number,
  rowCount: number,
): RowRange {
  const first = Math.max(0, Math.floor(scrolledPast / rowHeight) - OVERSCAN_ROWS)
  const last = Math.min(
    rowCount,
    Math.ceil((scrolledPast + screenHeight) / rowHeight) + OVERSCAN_ROWS,
  )
  return { first, last: Math.max(first, last) }
}

export type VirtualRows = {
  // Items firstIndex..lastIndex-1 are drawn.
  firstIndex: number
  lastIndex: number
  // Empty space standing in for the rows above and below that aren't drawn,
  // so the scrollbar is as long as the whole list.
  paddingTop: number
  paddingBottom: number
  columns: number
  // Scrolls the window so the item's row is in the middle of the screen.
  scrollToIndex: (index: number) => void
}

// Window virtualization for a CSS grid: only the rows near the screen are in the DOM.
// Every row has the same height (the cards have a fixed layout), so one measurement
// of one row tells us where every row is.
export function useVirtualRows(
  listRef: RefObject<HTMLElement | null>,
  itemCount: number,
): VirtualRows {
  const [size, setSize] = useState<RowSize | null>(null)
  const [range, setRange] = useState<RowRange>({ first: 0, last: 0 })

  const measure = useCallback(() => {
    const list = listRef.current
    const item = list?.querySelector('li')
    if (!list || !item) return
    const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0
    const next = {
      columns: countColumns(list),
      rowHeight: item.getBoundingClientRect().height + gap,
    }
    setSize((current) =>
      current?.columns === next.columns && current.rowHeight === next.rowHeight ? current : next,
    )
  }, [listRef])

  const columns = size?.columns ?? 1
  const rowCount = Math.ceil(itemCount / columns)

  const updateRange = useCallback(() => {
    const list = listRef.current
    if (!list || !size || size.rowHeight <= 0) return
    const next = visibleRows(
      -list.getBoundingClientRect().top,
      window.innerHeight,
      size.rowHeight,
      rowCount,
    )
    setRange((current) =>
      current.first === next.first && current.last === next.last ? current : next,
    )
  }, [listRef, size, rowCount])

  // Layout effects run before the browser paints, so the first frame already has the
  // right rows and nothing jumps.
  useLayoutEffect(() => {
    if (!size && itemCount > 0) measure()
  }, [size, itemCount, measure])
  useLayoutEffect(updateRange, [updateRange])

  useEventListener('scroll', updateRange, { passive: true })
  useEventListener('resize', measure)

  const scrollToIndex = useCallback(
    (index: number) => {
      const list = listRef.current
      if (!list || !size || size.rowHeight <= 0) return
      const rowTop =
        list.getBoundingClientRect().top +
        window.scrollY +
        Math.floor(index / size.columns) * size.rowHeight
      // 'instant' overrides the page's smooth scrolling: a keyboard jump should land
      // straight away, so the card is drawn and can take focus in the next render.
      window.scrollTo({
        top: rowTop - (window.innerHeight - size.rowHeight) / 2,
        behavior: 'instant',
      })
      updateRange()
    },
    [listRef, size, updateRange],
  )

  // Not measured yet: draw the start of the list so there is a row to measure.
  if (!size) {
    return {
      firstIndex: 0,
      lastIndex: Math.min(itemCount, ITEMS_BEFORE_MEASURING),
      paddingTop: 0,
      paddingBottom: 0,
      columns,
      scrollToIndex,
    }
  }
  // No layout to measure (a test DOM gives every element a height of 0): draw everything.
  if (size.rowHeight <= 0) {
    return {
      firstIndex: 0,
      lastIndex: itemCount,
      paddingTop: 0,
      paddingBottom: 0,
      columns,
      scrollToIndex,
    }
  }

  const last = Math.min(range.last, rowCount)
  const first = Math.min(range.first, last)
  return {
    firstIndex: first * columns,
    lastIndex: Math.min(itemCount, last * columns),
    paddingTop: first * size.rowHeight,
    paddingBottom: (rowCount - last) * size.rowHeight,
    columns,
    scrollToIndex,
  }
}
