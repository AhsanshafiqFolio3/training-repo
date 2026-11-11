import type { Customer } from '../../shared/types'

export function csvCell(value: string | number): string {
  const text = String(value)
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replaceAll('"', '""')}"`
}
export function customerCsv(customers: readonly Customer[]): string {
  return [
    ['Name', 'Email', 'City', 'Status', 'Orders', 'Spent (PKR)'],
    ...customers.map((customer) => [
      customer.name,
      customer.email,
      customer.city,
      customer.status,
      customer.orders,
      customer.spent,
    ]),
  ]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n')
}
export function downloadCsv(content: string): void {
  const url = URL.createObjectURL(
    new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'form-customers.csv'
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
