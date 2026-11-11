import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowDownToLine, CheckCircle2, Plus, Search } from 'lucide-react'
import { getCustomers } from '../../data/api'
import { useAsync } from '../../shared/useAsync'
import { EmptyState } from '../../shared/Feedback'
import { Toast } from '../../shared/Toast'
import { exportFailureRequested, readDemoMode, withoutParam } from '../../shared/demoMode'
import type { Customer } from '../../shared/types'
import { CustomerForm } from './CustomerForm'
import { CustomerStats } from './CustomerStats'
import { CustomerTable } from './CustomerTable'
import { ExportBanner } from './ExportBanner'
import { useCustomers } from './useCustomers'
import { useExportJob } from './useExportJob'
import { mergeCustomers } from './directory'

const statusFilters = ['All customers', 'Active', 'Inactive'] as const
type StatusFilter = (typeof statusFilters)[number]
function isStatusFilter(value: string): value is StatusFilter {
  return statusFilters.some((option) => option === value)
}
function matches(customer: Customer, search: string, status: StatusFilter): boolean {
  const text = `${customer.name} ${customer.email} ${customer.city}`.toLowerCase()
  return (
    text.includes(search.trim().toLowerCase()) &&
    (status === 'All customers' || customer.status === status)
  )
}
export function Customers(): ReactElement {
  const [params, setParams] = useSearchParams()
  const mode = readDemoMode(params.get('state'))
  const loader = useCallback((signal: AbortSignal) => getCustomers(mode, signal), [mode])
  const [state, retry] = useAsync(loader)
  const { addedCustomers, addCustomer } = useCustomers()
  const exportJob = useExportJob()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All customers')
  const [modal, setModal] = useState(false)
  const [notice, setNotice] = useState('')
  const all =
    state.status === 'success'
      ? mergeCustomers(state.data.data, mode === 'empty' ? [] : addedCustomers)
      : []
  const visible = all.filter((customer) => matches(customer, search, statusFilter))
  function retryLoad(): void {
    setParams((current) => withoutParam(current, 'state'), { replace: true })
    retry()
  }
  function clearFilters(): void {
    setSearch('')
    setStatusFilter('All customers')
  }
  function retryExport(): void {
    setParams((current) => withoutParam(current, 'exportError'), { replace: true })
    exportJob.start(visible, false)
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
              state.status !== 'success' || visible.length === 0 || exportJob.status === 'running'
            }
            onClick={() => exportJob.start(visible, exportFailureRequested(params))}
          >
            <ArrowDownToLine size={16} />
            {exportJob.status === 'running' ? 'Preparing export…' : 'Export customers'}
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
      <CustomerStats customers={state.status === 'success' ? all : null} />
      {exportJob.status !== 'idle' && (
        <ExportBanner
          status={exportJob.status}
          onDownload={exportJob.download}
          onRetry={retryExport}
          onDismiss={exportJob.dismiss}
        />
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
            action={all.length ? clearFilters : retryLoad}
            actionLabel={all.length ? 'Clear filters' : 'Reload customers'}
          />
        ) : (
          <CustomerTable customers={visible} />
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
        <Toast message={notice} onDismiss={() => setNotice('')} icon={<CheckCircle2 size={18} />} />
      )}
    </main>
  )
}
