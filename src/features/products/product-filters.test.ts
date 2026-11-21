import { describe, expect, it } from 'vitest'
import { toProductSearchParams } from '../../api/products'
import { hasActiveFilters, readFilters } from './product-filters'

describe('product filters in the URL', () => {
  it('reads every filter from the URL', () => {
    const filters = readFilters(
      new URLSearchParams('search=duck&category=ducks&inStock=true&sort=price-asc'),
    )
    expect(filters).toEqual({
      search: 'duck',
      category: 'ducks',
      inStock: true,
      sort: 'price-asc',
    })
  })

  it('falls back to defaults for values that make no sense', () => {
    const filters = readFilters(new URLSearchParams('category=hats&sort=random'))
    expect(filters).toEqual({
      search: '',
      category: undefined,
      inStock: false,
      sort: 'featured',
    })
    expect(hasActiveFilters(filters)).toBe(false)
  })

  it('writes the same URL it reads, leaving out defaults', () => {
    const url = 'search=duck&category=ducks&inStock=true&sort=rating'
    expect(toProductSearchParams(readFilters(new URLSearchParams(url))).toString()).toBe(url)
    expect(toProductSearchParams(readFilters(new URLSearchParams(''))).toString()).toBe('')
  })
})
