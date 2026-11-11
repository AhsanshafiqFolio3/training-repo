import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Circle,
  Mail,
  Plus,
  Search,
  RotateCcw,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { getCustomers, wait } from '../../data/api'
import { useAsync } from '../../shared/useAsync'
import { EmptyState } from '../../shared/Feedback'
import { money } from '../store/logic'
import { exportFailureRequested, readDemoMode, withoutParam } from '../../shared/demoMode'
import { CustomerForm } from './CustomerForm'
import { useCustomers } from './useCustomers'
import { initials } from './initials'
import { mergeCustomers } from './directory'
import { customerCsv, downloadCsv } from './export'
import type { Customer } from '../../shared/types'

const statusFilters = ['All customers', 'Active', 'Inactive'] as const
type StatusFilter = (typeof statusFilters)[number]
function isStatusFilter(value: string): value is StatusFilter {
  return statusFilters.some((option) => option === value)
}
export function Customers(): ReactElement {
  const [params, setParams] = useSearchParams()
  const mode = readDemoMode(params.get('state'))
  const loader = useCallback((signal: AbortSignal) => getCustomers(mode, signal), [mode])
  const [state, retry] = useAsync(loader)
  const { addedCustomers, addCustomer } = useCustomers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All customers')
  const [modal, setModal] = useState(false)
  const [notice, setNotice] = useState('')
  const [exportState, setExportState] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const exportController = useRef<AbortController | null>(null)
  const [exportContent, setExportContent] = useState('')
  useEffect(
    () => (): void => {
      exportController.current?.abort()
    },
    [],
  )
  const all =
    state.status === 'success'
      ? mergeCustomers(state.data.data, mode === 'empty' ? [] : addedCustomers)
      : []
  const visible = all.filter(
    (customer) =>
      `${customer.name} ${customer.email} ${customer.city}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (statusFilter === 'All customers' || customer.status === statusFilter),
  )
  const active = all.filter((customer) => customer.status === 'Active').length
  function retryLoad(): void {
    setParams((current) => withoutParam(current, 'state'), { replace: true })
    retry()
  }
  async function startExport(simulateFailure = exportFailureRequested(params)): Promise<void> {
    if (exportController.current && !exportController.current.signal.aborted) return
    const controller = new AbortController()
    exportController.current = controller
    const snapshot = customerCsv(visible)
    setExportState('running')
    try {
      await wait(1300, controller.signal)
      if (simulateFailure) {
        setExportState('error')
        return
      }
      setExportContent(snapshot)
      setExportState('success')
    } catch {
      return
    } finally {
      if (exportController.current === controller) exportController.current = null
    }
  }
  function retryExport(): void {
    setParams((current) => withoutParam(current, 'exportError'), { replace: true })
    void startExport(false)
  }
  function saveCustomer(customer: Customer): void {
    addCustomer(customer)
    setNotice(`${customer.name} was added to your workspace.`)
  }
  return (
    <main className="workspace page-container">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">THE FORM WORKSPACE</span>
          <h1>Good connections.</h1>
          <p>A little closer to the people behind every order.</p>
        </div>
        <div className="workspace-actions">
          <button
            className="button secondary"
            disabled={
              state.status !== 'success' || visible.length === 0 || exportState === 'running'
            }
            onClick={() => {
              void startExport()
            }}
          >
            <ArrowDownToLine size={16} />
            {exportState === 'running' ? 'Preparing export…' : 'Export customers'}
          </button>
          <button
            className="button dark"
            disabled={state.status !== 'success' || mode === 'empty'}
            onClick={() => setModal(true)}
          >
            <Plus size={16} />
            Add customer
          </button>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span>
            Total customers <Users size={18} />
          </span>
          <strong>
            {state.status === 'success' ? all.length.toString().padStart(2, '0') : '—'}
          </strong>
          <small>Every connection counts</small>
        </div>
        <div className="stat-card">
          <span>
            Active customers <Circle size={17} />
          </span>
          <strong>{state.status === 'success' ? active.toString().padStart(2, '0') : '—'}</strong>
          <small>
            {all.length
              ? `${Math.round((active / all.length) * 100)}% of your community`
              : 'Your growing community'}
          </small>
        </div>
        <div className="stat-card">
          <span>
            Total orders <ShoppingBag size={18} />
          </span>
          <strong>
            {state.status === 'success'
              ? all.reduce((sum, customer) => sum + customer.orders, 0)
              : '—'}
          </strong>
          <small>Thoughtfully packed essentials</small>
        </div>
        <div className="stat-card">
          <span>
            Customer spend <Wallet size={18} />
          </span>
          <strong className="stat-money">
            {state.status === 'success'
              ? money(all.reduce((sum, customer) => sum + customer.spent, 0))
              : '—'}
          </strong>
          <small>Across all customer orders</small>
        </div>
      </div>
      {exportState !== 'idle' && (
        <div className={`export-banner ${exportState}`} role="status">
          <div>
            {exportState === 'running' ? (
              <span className="spinner" />
            ) : exportState === 'error' ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
            <span>
              <strong>
                {exportState === 'running'
                  ? 'Getting your customer export ready…'
                  : exportState === 'success'
                    ? 'Your export is ready.'
                    : 'The export couldn’t be prepared.'}
              </strong>
              <small>
                {exportState === 'running'
                  ? 'You can keep exploring while we prepare your file.'
                  : exportState === 'success'
                    ? 'A CSV snapshot of the customers matching your filters.'
                    : 'No customer data was changed. Please try again.'}
              </small>
            </span>
          </div>
          {exportState === 'success' ? (
            <button className="button secondary" onClick={() => downloadCsv(exportContent)}>
              <ArrowDownToLine size={15} />
              Download CSV
            </button>
          ) : exportState === 'error' ? (
            <button className="button secondary" onClick={retryExport}>
              <RotateCcw size={15} />
              Try again
            </button>
          ) : null}
          {exportState !== 'running' && (
            <button
              className="icon-button"
              aria-label="Dismiss export result"
              onClick={() => setExportState('idle')}
            >
              <X size={17} />
            </button>
          )}
        </div>
      )}
      <section className="customer-section">
        <div className="customer-toolbar">
          <div>
            <h2>
              Your customers <span>{visible.length}</span>
            </h2>
            <p>Familiar names. New possibilities.</p>
          </div>
          <div className="customer-filters">
            <div className="search-box">
              <Search size={16} />
              <input
                aria-label="Search customers"
                placeholder="Search name, email or city…"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              aria-label="Filter customer status"
              value={statusFilter}
              onChange={(event) => {
                if (isStatusFilter(event.target.value)) setStatusFilter(event.target.value)
              }}
            >
              {statusFilters.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        {state.status === 'loading' ? (
          <div className="table-loading" role="status" aria-label="Loading customers">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="shimmer" key={i} />
            ))}
          </div>
        ) : state.status === 'error' ? (
          <EmptyState
            title="Let’s try that connection again."
            message={state.message}
            error
            action={retryLoad}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title={all.length ? 'No matching connections.' : 'Your community starts here.'}
            message={
              all.length
                ? 'Try another search or customer status.'
                : 'There are no customers to show in this view.'
            }
            action={
              all.length
                ? () => {
                    setSearch('')
                    setStatusFilter('All customers')
                  }
                : retryLoad
            }
            actionLabel={all.length ? 'Clear filters' : 'Reload customers'}
          />
        ) : (
          <div className="table-scroll">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Orders</th>
                  <th>Total spent</th>
                  <th>
                    <span className="sr-only">View customer</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <Link className="customer-name" to={`/customers/${customer.id}`}>
                        <span className="avatar" style={{ background: customer.color }}>
                          {initials(customer.name)}
                        </span>
                        <span>
                          <strong>{customer.name}</strong>
                          <small>
                            <Mail size={10} />
                            {customer.email}
                          </small>
                        </span>
                      </Link>
                    </td>
                    <td>{customer.city}</td>
                    <td>
                      <span className={`status-pill ${customer.status.toLowerCase()}`}>
                        <span />
                        {customer.status}
                      </span>
                    </td>
                    <td>{customer.orders}</td>
                    <td className="spend-cell">{money(customer.spent)}</td>
                    <td>
                      <Link
                        className="row-link"
                        aria-label={`View ${customer.name}`}
                        to={`/customers/${customer.id}`}
                      >
                        <ArrowRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>
            {visible.length} {visible.length === 1 ? 'customer' : 'customers'} · All in good
            company.
          </span>
          <span>FORM / CUSTOMER WORKSPACE</span>
        </div>
      </section>
      {modal && (
        <CustomerForm existing={all} onSave={saveCustomer} onClose={() => setModal(false)} />
      )}
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  )
}
