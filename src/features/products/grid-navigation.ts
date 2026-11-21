// Keyboard movement in a product grid, shared by the plain grid and the virtual one.

// How many cards fit in one row right now (it changes with screen width).
export function countColumns(grid: HTMLElement): number {
  return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1
}

// Arrow keys jump between cards like a spreadsheet: left/right by one, up/down by
// a row. Home and End go to the first and last card. Returns undefined for any
// other key, or when the move would leave the grid.
export function targetIndexForKey(
  key: string,
  index: number,
  columns: number,
  count: number,
): number | undefined {
  const targetByKey: Record<string, number> = {
    ArrowRight: index + 1,
    ArrowLeft: index - 1,
    ArrowDown: index + columns,
    ArrowUp: index - columns,
    Home: 0,
    End: count - 1,
  }
  const target = targetByKey[key]
  if (target === undefined || target < 0 || target >= count) return undefined
  return target
}
