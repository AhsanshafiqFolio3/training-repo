import type { ReactElement } from 'react'
import { Check, Plus, Star } from 'lucide-react'
import { ProductVisual } from '../../shared/ProductVisual'
import type { Product } from '../../shared/types'
import { money } from './logic'

interface ProductCardProps {
  product: Product
  quantityInBag: number
  onAdd: (product: Product) => void
}
function addLabel(soldOut: boolean, atLimit: boolean, quantity: number): string {
  if (soldOut) return 'Sold out'
  if (atLimit) return 'Max added'
  return quantity > 0 ? `Add (${quantity})` : 'Add'
}
export function ProductCard({ product, quantityInBag, onAdd }: ProductCardProps): ReactElement {
  const soldOut = product.stock === 0
  const atLimit = quantityInBag >= product.stock
  return (
    <article className="product-card">
      <div className="product-image" style={{ background: product.background }}>
        <div className="product-badges">
          {product.badge && (
            <span className={`badge ${product.badge === 'Bestseller' ? 'badge-best' : ''}`}>
              {product.badge === 'Bestseller' && <Star size={9} fill="currentColor" />}
              {product.badge}
            </span>
          )}
          {soldOut && <span className="badge badge-sold">Back soon</span>}
        </div>
        <ProductVisual product={product} />
        <span className="image-label">FORM / {product.category.toUpperCase()}</span>
      </div>
      <div className="product-meta">
        <span>{product.category}</span>
        <span className="rating">
          <Star size={11} fill="currentColor" />
          {product.rating.toFixed(1)}
        </span>
      </div>
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <div className="product-bottom">
        <strong>{money(product.price)}</strong>
        <button
          className={`add-button ${quantityInBag > 0 ? 'added' : ''}`}
          disabled={soldOut || atLimit}
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to bag`}
        >
          {quantityInBag > 0 && !atLimit ? <Check size={14} /> : <Plus size={14} />}{' '}
          {addLabel(soldOut, atLimit, quantityInBag)}
        </button>
      </div>
    </article>
  )
}
