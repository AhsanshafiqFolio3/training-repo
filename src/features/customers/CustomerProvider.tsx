import { useCallback, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { Customer } from '../../shared/types'
import { CustomerContext } from './useCustomers'

export function CustomerProvider({ children }: { children: ReactNode }): ReactElement {
  const [addedCustomers, setAddedCustomers] = useState<Customer[]>([])
  const addCustomer = useCallback((customer: Customer): void => {
    setAddedCustomers((current) => [...current, customer])
  }, [])
  const value = useMemo(() => ({ addedCustomers, addCustomer }), [addedCustomers, addCustomer])
  return <CustomerContext value={value}>{children}</CustomerContext>
}
