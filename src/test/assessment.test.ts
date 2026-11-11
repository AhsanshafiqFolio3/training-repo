import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { calculateTotals, cartReducer } from '../features/store/logic'

describe('Part B practice assessment: executable output grading', () => {
  it('Q1: lexical shadowing prints 3 1', () => {
    const value = 1
    function read(): number {
      const value = 3
      return value
    }
    expect(`${read()} ${value}`).toBe('3 1')
  })
  it('Q2: filtering prints 1 2 b without mutating the input', () => {
    const source = [
      { id: 'a', stock: 0 },
      { id: 'b', stock: 2 },
    ]
    const visible = source.filter((product) => product.stock > 0)
    expect(`${visible.length} ${source.length} ${visible[0].id}`).toBe('1 2 b')
  })
  it('Q3: repeated cart Add prints 1 2', () => {
    let cart = cartReducer([], { type: 'add', product: products[0] })
    cart = cartReducer(cart, { type: 'add', product: products[0] })
    expect(`${cart.length} ${cart[0].quantity}`).toBe('1 2')
  })
  it('Q4: strict discount boundary prints 0 500.1 4500.9', () => {
    const atBoundary = calculateTotals([{ product: { ...products[0], price: 5000 }, quantity: 1 }])
    const aboveBoundary = calculateTotals([
      { product: { ...products[0], price: 5001 }, quantity: 1 },
    ])
    expect(`${atBoundary.discount} ${aboveBoundary.discount} ${aboveBoundary.total}`).toBe(
      '0 500.1 4500.9',
    )
  })
  it('Q5: the promise continuation prints A C B', async () => {
    const output: string[] = []
    output.push('A')
    const continuation = Promise.resolve().then(() => {
      output.push('B')
    })
    output.push('C')
    await continuation
    expect(output).toEqual(['A', 'C', 'B'])
  })
})
