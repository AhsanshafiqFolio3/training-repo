import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Code2, FlaskConical, Layers, NotebookPen } from 'lucide-react'

const demoModes = ['success', 'slow', 'empty', 'error'] as const
const demoPages = [
  { path: '/', label: 'Store collection' },
  { path: '/customers', label: 'Customer workspace' },
] as const
const scenarioLinks = [
  { to: '/customers/c01', label: 'Race: next customer' },
  { to: '/customers/not-found', label: 'Unknown customer' },
  { to: '/customers/c01?state=error', label: 'Detail error' },
  { to: '/customers?exportError=1', label: 'Export failure' },
] as const

function modeLabel(mode: (typeof demoModes)[number]): string {
  return mode === 'slow' ? 'Slow loading' : mode[0].toUpperCase() + mode.slice(1)
}
export function Guide(): ReactElement {
  return (
    <main className="guide-page page-container">
      <span className="eyebrow">BUILT WITH INTENTION</span>
      <h1>The project, considered.</h1>
      <p className="guide-intro">
        A working store. A customer workspace. A place to put the fundamentals into practice.
      </p>
      <div className="guide-cards">
        <div>
          <Layers size={23} />
          <h2>Two connected experiences.</h2>
          <p>Explore the collection, build a bag, or manage the customer community.</p>
          <Link className="text-link" to="/customers">
            Open workspace <ArrowRight size={15} />
          </Link>
        </div>
        <div>
          <Code2 size={23} />
          <h2>Simple, explicit rules.</h2>
          <p>
            PKR prices include tax. Delivery is free. Get 10% off when the subtotal is strictly
            above Rs. 5,000.
          </p>
        </div>
        <div>
          <NotebookPen size={23} />
          <h2>Sample data only.</h2>
          <p>
            Products and customers are sample records. Checkout, customer saves and export jobs are
            simulated.
          </p>
        </div>
      </div>
      <section className="state-lab">
        <div>
          <FlaskConical size={24} />
          <div>
            <h2>Try every state.</h2>
            <p>
              These links make loading, empty and error states easy to review. Retry restores the
              normal data.
            </p>
          </div>
        </div>
        <div className="state-links">
          {demoPages.map(({ path, label }) => (
            <div key={path}>
              <h3>{label}</h3>
              {demoModes.map((mode) => (
                <Link key={mode} to={`${path}?state=${mode}`}>
                  {modeLabel(mode)}
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
          ))}
          <div>
            <h3>Detail & export</h3>
            {scenarioLinks.map(({ to, label }) => (
              <Link key={to} to={to}>
                {label}
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="guide-footnote">
        New customers and bag contents are kept in memory for the current session. This project has
        no real customer records, authentication or payment processing.
      </div>
    </main>
  )
}
