import { createContext, useContext, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { Customer } from '../../shared/types'

interface CustomerContextValue {
  addedCustomers: Customer[]
  addCustomer: (customer: Customer) => void
}
const CustomerContext = createContext<CustomerContextValue | null>(null)
export function CustomerProvider({ children }: { children: ReactNode }): ReactElement {
  const [addedCustomers, setAddedCustomers] = useState<Customer[]>([])
  function addCustomer(customer: Customer): void {
    setAddedCustomers((current) => [...current, customer])
  }
  return (
    <CustomerContext.Provider value={{ addedCustomers, addCustomer }}>
      {children}
    </CustomerContext.Provider>
  )
}
export function useCustomers(): CustomerContextValue {
  const context = useContext(CustomerContext)
  if (!context) throw new Error('useCustomers requires CustomerProvider')
  return context
}
