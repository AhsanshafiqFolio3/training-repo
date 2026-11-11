import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, ShoppingBag, Wallet } from 'lucide-react'
import { getCustomer } from '../../data/api'
import { customers } from '../../data/customers'
import { useAsync } from '../../shared/useAsync'
import { EmptyState } from '../../shared/Feedback'
import { money } from '../store/logic'
import { readDemoMode, withoutParam } from '../../shared/demoMode'
import { useCustomers } from './useCustomers'
import { initials } from './initials'

export function CustomerDetail(): ReactElement {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const mode = readDemoMode(params.get('state'))
  const { addedCustomers } = useCustomers()
  const loader = useCallback(
    async (signal: AbortSignal) => {
      const local = addedCustomers.find((customer) => customer.id === id)
      return local && mode === 'success' ? { data: local, total: 1 } : getCustomer(id, signal, mode)
    },
    [id, addedCustomers, mode],
  )
  const [state, retry] = useAsync(loader)
  const all = [...customers, ...addedCustomers]
  const position = all.findIndex((customer) => customer.id === id)
  const next = position >= 0 ? all[(position + 1) % all.length] : all[0]
  return (
    <main className="detail-page page-container">
      <Link className="back-link" to="/customers">
        <ArrowLeft size={16} />
        All customers
      </Link>
      <div className="detail-header">
        <div>
          <span className="eyebrow">A LITTLE MORE FAMILIAR</span>
          <h1>Behind the order.</h1>
        </div>
        {next && (
          <Link className="button secondary" to={`/customers/${next.id}`}>
            Next customer <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {state.status === 'loading' ? (
        <div className="detail-loading shimmer" role="status" aria-label="Loading customer" />
      ) : state.status === 'error' ? (
        <EmptyState
          title="Connection interrupted."
          message={state.message}
          error
          action={() => {
            setParams((current) => withoutParam(current, 'state'), { replace: true })
            retry()
          }}
        />
      ) : !state.data.data ? (
        <EmptyState
          title="This connection isn’t here."
          message="This customer may not exist, or was added in a previous demo session."
        />
      ) : (
        <div className="detail-grid">
          <section className="profile-card">
            <span className="avatar large" style={{ background: state.data.data.color }}>
              {initials(state.data.data.name)}
            </span>
            <span className={`status-pill ${state.data.data.status.toLowerCase()}`}>
              <span />
              {state.data.data.status}
            </span>
            <h2>{state.data.data.name}</h2>
            <a href={`mailto:${state.data.data.email}`}>{state.data.data.email}</a>
            <div className="profile-divider" />
            <p>
              <MapPin size={16} />
              {state.data.data.city}, Pakistan
            </p>
            <p>
              <CalendarDays size={16} />
              Joined{' '}
              {new Date(`${state.data.data.joined}T12:00:00`).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <span className="profile-id">CUSTOMER / {state.data.data.id.toUpperCase()}</span>
          </section>
          <section className="customer-overview">
            <h2>A connection, at a glance.</h2>
            <p>Every everyday essential tells a little story.</p>
            <div className="detail-stats">
              <div>
                <ShoppingBag size={22} />
                <strong>{state.data.data.orders}</strong>
                <span>Orders placed</span>
              </div>
              <div>
                <Wallet size={22} />
                <strong>{money(state.data.data.spent)}</strong>
                <span>Total spent</span>
              </div>
            </div>
            <div className="customer-note">
              <span className="note-spark">✳</span>
              <h3>Part of the everyday.</h3>
              <p>
                {state.data.data.orders > 0
                  ? `${state.data.data.name.split(' ')[0]} has chosen Form ${state.data.data.orders} times. Here’s to more good things, thoughtfully chosen.`
                  : 'A new connection with good things ahead. Their first everyday essential is still to come.'}
              </p>
            </div>
            <Link className="text-link" to="/">
              Explore the collection <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      )}
    </main>
  )
}
