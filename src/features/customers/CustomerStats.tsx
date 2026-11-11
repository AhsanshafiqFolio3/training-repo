import type { ReactElement } from 'react'
import { Circle, ShoppingBag, Users, Wallet } from 'lucide-react'
import { money } from '../store/logic'
import type { Customer } from '../../shared/types'

function twoDigits(value: number): string {
  return value.toString().padStart(2, '0')
}
export function CustomerStats({
  customers,
}: {
  customers: readonly Customer[] | null
}): ReactElement {
  const total = customers?.length ?? 0
  const active = customers?.filter((customer) => customer.status === 'Active').length ?? 0
  const orders = customers?.reduce((sum, customer) => sum + customer.orders, 0) ?? 0
  const spent = customers?.reduce((sum, customer) => sum + customer.spent, 0) ?? 0
  const loaded = customers !== null
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span>
          Total customers <Users size={18} />
        </span>
        <strong>{loaded ? twoDigits(total) : '—'}</strong>
        <small>Every connection counts</small>
      </div>
      <div className="stat-card">
        <span>
          Active customers <Circle size={17} />
        </span>
        <strong>{loaded ? twoDigits(active) : '—'}</strong>
        <small>
          {total
            ? `${Math.round((active / total) * 100)}% of your community`
            : 'Your growing community'}
        </small>
      </div>
      <div className="stat-card">
        <span>
          Total orders <ShoppingBag size={18} />
        </span>
        <strong>{loaded ? orders : '—'}</strong>
        <small>Thoughtfully packed essentials</small>
      </div>
      <div className="stat-card">
        <span>
          Customer spend <Wallet size={18} />
        </span>
        <strong className="stat-money">{loaded ? money(spent) : '—'}</strong>
        <small>Across all customer orders</small>
      </div>
    </div>
  )
}
