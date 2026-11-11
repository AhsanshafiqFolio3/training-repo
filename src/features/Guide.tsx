import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, Code2, FlaskConical, Layers, NotebookPen } from 'lucide-react'

const requirements = [
  ['Setup', 'React + TypeScript + Vite; source and private hosting workflow.'],
  ['Data', '20 original products served through an asynchronous data module.'],
  ['Product list', 'Stable product.id keys; source-empty and filtered-empty states.'],
  ['Filters', 'Live search, category and stock inputs; visible products are derived.'],
  ['Cart', 'Repeated adds increment the existing row; stock limits are enforced.'],
  ['Pricing', 'Remove, decrement, total units, subtotal, discount and payable total.'],
  ['TypeScript', 'Strict models, props, API responses and explicit function returns.'],
  ['UI states', 'Loading, success, empty, error and retry demonstrations.'],
  ['Testing', 'Automated pricing, validation, cart, filters, modal and race tests.'],
  ['AI notes', 'Prompts, accepted choices, rejected suggestions and test evidence.'],
  ['Part A', 'Concept explanations with examples in the assessment document.'],
  ['Part B', 'Five project-created output predictions verified 5/5, with reasons.'],
  ['Part C', 'Cart rewrite exercise with a relevant test checklist.'],
  ['Part D', 'Five scenario answers: partial failure, duplicates, races, 404s and AI review.'],
  ['Supplement', 'Project-created theory and dashboard scenarios.'],
  ['Practical', 'Customer list/detail, race fix, keyboard modal, CSV export and bug trace.'],
  [
    'Review call',
    'AI project review: 92/100. Code explanations, bug traces and rehearsal delivered.',
  ],
  [
    'Readiness',
    'Final-project checklist complete. Source, assessment evidence and submission packaged.',
  ],
]
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
          <h2>Created for this project.</h2>
          <p>
            Products, customers, business rules and practice assessments were created with your
            approval. Checkout, saves and export jobs are simulated.
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
          {(['/', '/customers'] as const).map((path) => (
            <div key={path}>
              <h3>{path === '/' ? 'Store collection' : 'Customer workspace'}</h3>
              {(['success', 'slow', 'empty', 'error'] as const).map((mode) => (
                <Link key={mode} to={`${path}?state=${mode}`}>
                  {mode === 'slow' ? 'Slow loading' : mode[0].toUpperCase() + mode.slice(1)}
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
          ))}
          <div>
            <h3>Detail & export</h3>
            <Link to="/customers/c01">
              Race: next customer
              <ArrowRight size={13} />
            </Link>
            <Link to="/customers/not-found">
              Unknown customer
              <ArrowRight size={13} />
            </Link>
            <Link to="/customers/c01?state=error">
              Detail error
              <ArrowRight size={13} />
            </Link>
            <Link to="/customers?exportError=1">
              Export failure
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
      <section className="requirements">
        <div className="requirements-title">
          <h2>Project delivery complete.</h2>
          <span>18 REQUIREMENTS</span>
        </div>
        <p className="requirements-note">
          All final-project deliverables are complete. Automated checks, practice assessment results
          and the AI project review are included in the submission documentation.
        </p>
        {requirements.map(([title, description], index) => (
          <div className="requirement-row" key={title}>
            <span className="requirement-index">{String(index + 1).padStart(2, '0')}</span>
            <strong>{title}</strong>
            <p>{description}</p>
            <CheckCircle2 size={18} aria-label="Project deliverable complete" />
          </div>
        ))}
      </section>
      <div className="guide-footnote">
        New customers and bag contents are kept in memory for the current session. This project has
        no real customer records, authentication or payment processing.
      </div>
    </main>
  )
}
