import type { Category, Product } from '../api/types'

export const PRODUCT_COUNT = 5000

// A seeded random number generator (mulberry32). The same seed always gives
// the same numbers, so every page load and every test sees the same 5,000 products.
function createRandom(seed: number): () => number {
  let state = seed
  return function random(): number {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

type CategoryRecipe = {
  minPrice: number
  maxPrice: number
  makeName: (pick: <T>(options: readonly T[]) => T) => string
}

const KEYBOARD_STYLES = ['Clacky', 'Silent', 'Retro', 'Midnight', 'Pastel', 'Thocky', 'Arctic']
const KEYBOARD_SIZES = ['60%', '65%', '75%', 'TKL', 'Full-size']
const KEYBOARD_SWITCHES = ['Red', 'Brown', 'Blue', 'Silent']
const DUCK_SIZES = ['Mini', 'Classic', 'Jumbo']
const DUCK_THEMES = ['Debugging', 'Pirate', 'Astronaut', 'Wizard', 'Ninja', 'Senior Dev', 'Intern']
const COFFEE_BLENDS = ['Merge Conflict', 'Hotfix', 'Deploy Friday', 'Stand-up', 'Stack Trace']
const COFFEE_ROASTS = ['Light Roast', 'Medium Roast', 'Dark Roast', 'Espresso']
const COFFEE_ORIGINS = ['Ethiopia', 'Colombia', 'Sumatra', 'Brazil', 'Kenya']
const STICKER_PHRASES = ['It Works On My Machine', '404 Not Found', 'Ship It', 'Tabs vs Spaces']
const STICKER_FINISHES = ['Holographic', 'Matte', 'Glossy']

const RECIPES: Record<Category, CategoryRecipe> = {
  keyboards: {
    minPrice: 49,
    maxPrice: 249,
    makeName: (pick) =>
      `${pick(KEYBOARD_STYLES)} ${pick(KEYBOARD_SIZES)} Keyboard (${pick(KEYBOARD_SWITCHES)} switches)`,
  },
  ducks: {
    minPrice: 4,
    maxPrice: 29,
    makeName: (pick) => `${pick(DUCK_SIZES)} ${pick(DUCK_THEMES)} Rubber Duck`,
  },
  coffee: {
    minPrice: 8,
    maxPrice: 29,
    makeName: (pick) =>
      `${pick(COFFEE_BLENDS)} ${pick(COFFEE_ROASTS)} (${pick(COFFEE_ORIGINS)}, 250g)`,
  },
  stickers: {
    minPrice: 1,
    maxPrice: 9,
    makeName: (pick) => `${pick(STICKER_FINISHES)} "${pick(STICKER_PHRASES)}" Sticker`,
  },
}

const CATEGORY_ORDER: readonly Category[] = ['keyboards', 'ducks', 'coffee', 'stickers']

export function seedProducts(count = PRODUCT_COUNT, seed = 2024): Product[] {
  const random = createRandom(seed)
  function between(min: number, max: number): number {
    return min + Math.floor(random() * (max - min + 1))
  }
  function pick<T>(options: readonly T[]): T {
    const option = options[Math.floor(random() * options.length)]
    if (option === undefined) throw new Error('pick() needs at least one option')
    return option
  }

  const products: Product[] = []
  for (let index = 1; index <= count; index++) {
    const category = pick(CATEGORY_ORDER)
    const recipe = RECIPES[category]
    const serial = String(index).padStart(4, '0')
    // About 1 in 10 products is sold out and 1 in 10 is nearly gone,
    // so the out-of-stock paths are easy to find.
    const stockRoll = random()
    const stock = stockRoll < 0.1 ? 0 : stockRoll < 0.2 ? between(1, 3) : between(4, 60)

    products.push({
      id: `prod-${serial}`,
      name: `${recipe.makeName(pick)} #${serial}`,
      // Whole dollars minus one cent, stored in cents: 2499 means $24.99.
      price: between(recipe.minPrice, recipe.maxPrice) * 100 - 1,
      category,
      stock,
      rating: between(25, 50) / 10,
      imageUrl: `${import.meta.env.BASE_URL}images/products/${category}.svg`,
    })
  }
  return products
}
