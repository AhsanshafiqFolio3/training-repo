# Performance

D4-2 asks us to measure the product list and fix its two slowest spots. D4-3 asks us to keep
the 5,000-item list smooth and to justify each optimization, including one we skipped.

## The list we measured

Until Day 3 the shop showed 24 products per page with Previous/Next buttons, so there was
never a long list to be slow. To make "the 5,000-item list" real, the shop now loads the
next page by itself as you scroll (infinite scroll, with a **Load more products** button
for keyboard users). Scroll far enough and all 5,000 products are on the page.

We measured that version first, with no optimizations, then fixed one thing at a time.

## How we measured

- Production build (`npm run build`, then `npm run preview`) in Chrome, window 1280×900.
- Mock API latency set to **Instant**, so the numbers are our rendering cost and not the
  pretend network wait.
- A small script clicked **Load more** until all 5,000 products were loaded. It timed each
  click until the next frame was painted, and read Chrome's own counters for script and
  layout time. Then it scrolled the whole page, timing every frame, and clicked **Add** on a
  product.
- Every number is the **median of 3 runs**. Single runs varied by up to 2×.

You can repeat any of this by hand: open Chrome DevTools, go to the **Performance** tab, record
while clicking **Load more** a few times, and look at the length of each task. With React
DevTools installed, its **Profiler** tab shows which components rendered and why.

## Results

| Measurement (all 5,000 loaded unless noted) | Before | After fix 1 | After fix 2 |
| ------------------------------------------- | -----: | ----------: | ----------: |
| Load next page, with 250 loaded             |  73 ms |       36 ms |       27 ms |
| Load next page, with 1,000 loaded           | 153 ms |       59 ms |       29 ms |
| Load next page, with 2,500 loaded           | 656 ms |      120 ms |       28 ms |
| Load next page, with 5,000 loaded           |  1.3 s |      251 ms |       28 ms |
| JavaScript time for that last page          |  1.0 s |       41 ms |        3 ms |
| Product cards in the page                   |  5,000 |       5,000 |          20 |
| HTML elements in the page                   | 91,025 |      91,025 |         451 |
| Memory used by JavaScript (heap)            | 265 MB |       63 MB |       13 MB |
| Click **Add**, until the screen updates     | 141 ms |      150 ms |       19 ms |
| Slowest frame while scrolling               |  44 ms |       51 ms |       22 ms |

About 27 ms of every "load next page" time is the measuring itself: waiting for the mock's
timer and for the next frame (one frame is 16.7 ms). So after fix 2, loading a page costs
almost nothing on top of that, no matter how long the list is.

Anything over about 100 ms feels like a delay, and over 50 ms shows up as a stutter
("long task"). Before the fixes, every page after the first 1,000 products was a visible freeze.

## Slow spot 1: every new page re-rendered every card (fix: `memo`)

**What we saw.** The time to add a page grew with the number of products already on the
page, and almost all of it was JavaScript: 1 second of script for 24 new cards when 5,000
were loaded. That pattern (cost grows with what's already there) means old cards were
doing work, not just the 24 new ones.

**Why.** When a page arrives, `ProductListPage` renders with a longer array, so the grid
renders, and by default React renders every child again: all 5,000 cards for 24 new ones.
In React DevTools' Profiler this shows up as every `ProductCard` highlighted on each load.

**Fix.** `ProductCard` is wrapped in `React.memo` (`src/features/products/product-card.tsx`).
A memoized component skips rendering when its props are the same as last time. That
works here because the props really do stay the same for old cards:

- `product`: the pages are kept as they arrived, so each card gets the same object every time.
- `index`: a card's position never changes when pages are added at the end.
- `onLinkKeyDown`: the key handler never changes. In the virtual grid it reads the latest
  values through a ref, for exactly this reason. A new function would be a new prop for
  every card and quietly undo the memo.

**Result.** Script time for a page at 5,000 went from 1,017 ms to 41 ms, and memory from
265 MB to 63 MB (far less garbage from re-rendering).

## Slow spot 2: 5,000 cards in the DOM (fix: virtualization)

**What we saw.** After fix 1, JavaScript was fast, but loading a page still took 251 ms and
clicking **Add** still took about 150 ms, of which only about 10 ms was JavaScript. The
rest was the browser laying out and painting a page of 91,025 elements. Any change, even
one button's label, makes the browser do work across that huge page.

**Fix.** The shop's grid (`VirtualProductGrid`, using `useVirtualRows`) only puts the rows
near the screen in the DOM: what you can see, plus 3 rows above and below. Empty padding
above and below stands in for the rest, so the scrollbar is as long as the whole list. As
you scroll, rows that leave are removed and rows that arrive are added.

- Every row has the same height. Card titles are always two lines (CSS `line-clamp`), so
  one measurement tells us where every row is. Columns are read from the CSS grid, so it
  still works when the screen width changes the number of columns.
- Keyboard: arrow keys, Home and End still work across the whole list. If the target card
  isn't drawn (End from the top), the grid scrolls to it and focuses it once it's drawn.
- Screen readers: each card carries `aria-posinset` and `aria-setsize`, so "product 120 of
  2,400" is announced even though only about 30 cards exist in the DOM.

**Result.** 20 cards and 451 elements instead of 5,000 cards and 91,025 elements. A new page
costs the same at 5,000 products as at 250, **Add** takes 19 ms, and memory is 13 MB.

## Other memoization that is there on purpose

- **One card per live stock change.** Live stock (D4-4) lives in Redux, and each card selects
  only its own product's stock (`selectStock`). The selector returns a number, so when one
  product's stock changes, react-redux re-renders that one card and nothing else.
- **`useMemo` for the flat list of products.** `useProductPages` joins the pages into one
  array with `useMemo`. Without it the array would be new on every render, and every
  component given it would render again.

## What we skipped, and why

- **Speeding up the mock's filtering and sorting.** Every request filters and sorts all
  5,000 products, which sounded expensive. We timed it first: 0.2 ms to sort by id, 2.6 ms
  by name, 0.3 ms to filter (median of 15 runs). A page takes 28 ms in total, so caching
  sorted results or moving the work to a Web Worker would save almost nothing and add
  code to maintain. Skipped.
- **`useCallback` for the card's Add button.** Its `onClick` is a new function on each
  render, but it goes to a plain `<button>`, not to a memoized component, so nothing renders
  less if it stays the same. The card itself is already memoized. Skipped.
- **A virtualization library** such as `react-window` or TanStack Virtual. They handle cases
  we don't have (rows of different heights, horizontal lists). Our rows are all the same
  height, and the brief asks us to know what's in the code, so we wrote about 100 lines
  ourselves instead of adding a dependency.
