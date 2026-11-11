import { describe, expect, it } from 'vitest'
import { customers } from '../../data/customers'
import { mergeCustomers, nextCustomerId } from './directory'

const [first, second] = customers
describe('customer directory', () => {
  it('appends session customers after loaded ones without duplicating ids', () => {
    const added = { ...first, id: 'c-new', email: 'new@example.com' }
    const merged = mergeCustomers([first, second], [second, added])
    expect(merged.map((customer) => customer.id)).toEqual([first.id, second.id, 'c-new'])
  })
  it('wraps to the first customer and starts at the beginning for unknown ids', () => {
    expect(nextCustomerId(['c01', 'c02', 'c03'], 'c01')).toBe('c02')
    expect(nextCustomerId(['c01', 'c02', 'c03'], 'c03')).toBe('c01')
    expect(nextCustomerId(['c01', 'c02'], 'missing')).toBe('c01')
    expect(nextCustomerId([], 'c01')).toBeNull()
  })
})
