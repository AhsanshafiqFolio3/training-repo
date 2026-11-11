import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Mail } from 'lucide-react'
import { money } from '../store/logic'
import type { Customer } from '../../shared/types'
import { initials } from './initials'

export function CustomerTable({ customers }: { customers: readonly Customer[] }): ReactElement {
  return (
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
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>
                <Link
                  className="customer-name"
                  to={`/customers/${customer.id}`}
                  aria-label={`${customer.name}, ${customer.email}`}
                >
                  <span
                    className="avatar"
                    style={{ background: customer.color }}
                    aria-hidden="true"
                  >
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
  )
}
