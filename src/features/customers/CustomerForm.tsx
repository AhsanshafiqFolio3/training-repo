import { useRef, useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { Modal } from '../../shared/Modal'
import type { Customer, CustomerDraft, ValidationErrors } from '../../shared/types'
import { wait } from '../../shared/wait'
import { useUnmountSignal } from '../../shared/useUnmountSignal'
import { validateCustomer } from './validation'

interface CustomerFormProps {
  existing: Customer[]
  onSave: (customer: Customer) => void
  onClose: () => void
}
export function CustomerForm({ existing, onSave, onClose }: CustomerFormProps): ReactElement {
  const [draft, setDraft] = useState<CustomerDraft>({ name: '', email: '', city: '' })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const unmountSignal = useUnmountSignal()
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (pending.current) return
    const nextErrors = validateCustomer(draft)
    if (
      existing.some((customer) => customer.email.toLowerCase() === draft.email.trim().toLowerCase())
    )
      nextErrors.email = 'A customer with this email already exists.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    pending.current = true
    setSaving(true)
    try {
      await wait(500, unmountSignal())
    } catch {
      return
    }
    onSave({
      id: `c-${crypto.randomUUID()}`,
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      city: draft.city.trim(),
      joined: new Date().toISOString().slice(0, 10),
      status: 'Active',
      orders: 0,
      spent: 0,
      color: '#e4e7db',
    })
    onClose()
  }
  return (
    <Modal
      title="A new connection."
      onClose={() => {
        if (!pending.current) onClose()
      }}
    >
      <p className="modal-description">Add a customer to your workspace.</p>
      <form
        noValidate
        onSubmit={(event) => {
          void submit(event)
        }}
      >
        {(['name', 'email', 'city'] as const).map((field) => (
          <div className="form-field" key={field}>
            <label htmlFor={`customer-${field}`}>
              {field === 'name' ? 'Full name' : field === 'email' ? 'Email address' : 'City'}
            </label>
            <input
              id={`customer-${field}`}
              data-autofocus={field === 'name' ? '' : undefined}
              type={field === 'email' ? 'email' : 'text'}
              autoComplete={
                field === 'name' ? 'name' : field === 'email' ? 'email' : 'address-level2'
              }
              value={draft[field]}
              disabled={saving}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
              placeholder={
                field === 'name'
                  ? 'e.g. Ayesha Khan'
                  : field === 'email'
                    ? 'name@example.com'
                    : 'e.g. Karachi'
              }
              onChange={(event) =>
                setDraft((current) => ({ ...current, [field]: event.target.value }))
              }
            />
            {errors[field] && (
              <p className="field-error" id={`${field}-error`} role="alert">
                {errors[field]}
              </p>
            )}
          </div>
        ))}
        <p className="form-info">
          <Info size={14} /> This demo keeps new customers for your current session.
        </p>
        <div className="modal-actions">
          <button type="button" className="button secondary" disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button dark" disabled={saving}>
            {saving ? 'Adding customer…' : 'Add customer'}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  )
}
