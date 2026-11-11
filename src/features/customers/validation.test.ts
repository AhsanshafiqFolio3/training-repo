import { describe, expect, it } from 'vitest'
import { validateCustomer } from './validation'
import { csvCell, customerCsv } from './export'
import { customers } from '../../data/customers'

const valid = { name: 'Ayesha Khan', email: 'ayesha@example.com', city: 'Karachi' }
describe('customer validation', () => {
  it('accepts a valid customer and trims whitespace for validation', () => {
    expect(validateCustomer(valid)).toEqual({})
    expect(validateCustomer({ ...valid, name: '  Ali  ', city: '  Lahore  ' })).toEqual({})
  })
  it.each(['', ' ', 'A', 'a'.repeat(81)])('rejects invalid names: %s', (name) =>
    expect(validateCustomer({ ...valid, name }).name).toBeDefined(),
  )
  it.each([
    'a@',
    'a b@example.com',
    '@example.com',
    'a@example',
    '',
    'a'.repeat(255) + '@example.com',
  ])('rejects invalid email: %s', (email) =>
    expect(validateCustomer({ ...valid, email }).email).toBeDefined(),
  )
  it('checks name and city boundaries inclusively', () => {
    expect(validateCustomer({ ...valid, name: 'Ab', city: 'Cd' })).toEqual({})
    expect(validateCustomer({ ...valid, name: 'a'.repeat(80), city: 'b'.repeat(80) })).toEqual({})
    expect(validateCustomer({ ...valid, city: 'a'.repeat(81) }).city).toBeDefined()
    expect(validateCustomer({ ...valid, city: ' ' }).city).toBeDefined()
  })
})
describe('CSV export', () => {
  it('quotes commas, quotes and line breaks', () => {
    expect(csvCell('Ali, "A"\nKhan')).toBe('"Ali, ""A""\nKhan"')
  })
  it.each(['=1+1', '+SUM(A1)', '-1+2', '@formula', '  =WEBSERVICE("test")'])(
    'neutralizes formula prefixes: %s',
    (value) => expect(csvCell(value).startsWith('"\'')).toBe(true),
  )
  it('exports only supplied rows and includes a header', () => {
    const csv = customerCsv([customers[0]])
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(csv).toContain('Ayesha Khan')
    expect(csv).not.toContain('Omar Farooq')
  })
})
