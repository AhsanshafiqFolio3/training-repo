const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Prices are stored in whole cents to avoid floating-point rounding (0.1 + 0.2).
// We only divide by 100 at the last moment, when showing the price.
export function formatPrice(cents: number): string {
  return dollars.format(cents / 100)
}
