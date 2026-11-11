import { createContext, useContext } from 'react'
import type { Customer } from '../../shared/types'

export interface CustomerContextValue {
  addedCustomers: Customer[]
  addCustomer: (customer: Customer) => void
}
export const CustomerContext = createContext<CustomerContextValue | null>(null)
export function useCustomers(): CustomerContextValue {
  const context = useContext(CustomerContext)
  if (!context) throw new Error('useCustomers requires CustomerProvider')
  return context
}
