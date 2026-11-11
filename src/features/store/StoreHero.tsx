import type { ReactElement } from 'react'
import { ArrowRight, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { ProductVisual } from '../../shared/ProductVisual'

export function StoreHero(): ReactElement {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span /> THE EVERYDAY COLLECTION
          </span>
          <h1>
            Everyday,
            <br />
            <em>considered.</em>
          </h1>
          <p>
            Good design. Useful things. A little more joy.
            <br />
            Discover tech that fits the way you live.
          </p>
          <a className="hero-link" href="#collection">
            Find your everyday <ArrowRight size={18} />
          </a>
        </div>
        <div className="hero-visual">
          <span className="hero-circle" />
          <div className="hero-headphones">
            <ProductVisual product={{ kind: 'headphones', color: '#3c453b' }} />
          </div>
          <div className="hero-speaker">
            <ProductVisual product={{ kind: 'speaker', color: '#bf885d' }} />
          </div>
          <span className="hero-product-label">
            LESS NOISE.
            <br />
            MORE YOU.<span>Studio Wireless — 01</span>
          </span>
          <span className="hero-edition">CURATED WITH PURPOSE / VOL. 01</span>
        </div>
      </section>
      <div className="benefits">
        <span>
          <Truck size={16} /> Free delivery, every order
        </span>
        <span>
          <ShieldCheck size={16} /> Quality you can count on
        </span>
        <span>
          <Sparkles size={16} /> 10% off above Rs. 5,000
        </span>
        <span className="benefits-end">Small details. Big difference.</span>
      </div>
    </>
  )
}
