export const categories = ['Audio', 'Workspace', 'Wearables', 'Accessories'] as const
export type Category = (typeof categories)[number]
export type ProductKind =
  | 'headphones'
  | 'earbuds'
  | 'speaker'
  | 'keyboard'
  | 'mouse'
  | 'lamp'
  | 'watch'
  | 'charger'
  | 'stand'
  | 'camera'
export interface Product {
  id: string
  name: string
  description: string
  category: Category
  price: number
  stock: number
  rating: number
  kind: ProductKind
  color: string
  background: string
  badge?: 'Bestseller' | 'New arrival'
}
export interface CartItem {
  product: Product
  quantity: number
}
export interface ProductFilters {
  search: string
  category: Category | 'All products'
  inStock: boolean
}
export interface ApiResponse<T> {
  data: T
  total: number
}
export type DemoMode = 'success' | 'slow' | 'empty' | 'error'
