import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CustomerForm } from './CustomerForm'
import { customers } from '../../data/customers'
import type { Customer } from '../../shared/types'

describe('customer modal form', () => {
  it('shows field errors and rejects duplicate emails case-insensitively', async () => {
    const user = userEvent.setup(),
      save = vi.fn<(customer: Customer) => void>()
    render(<CustomerForm existing={[...customers]} onSave={save} onClose={vi.fn<() => void>()} />)
    await user.click(screen.getByRole('button', { name: 'Add customer' }))
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    await user.type(screen.getByLabelText('Full name'), 'Ayesha Khan')
    await user.type(screen.getByLabelText('Email address'), 'AYESHA.KHAN@example.com')
    await user.type(screen.getByLabelText('City'), 'Karachi')
    await user.click(screen.getByRole('button', { name: 'Add customer' }))
    expect(screen.getByRole('alert')).toHaveTextContent('already exists')
    expect(save).not.toHaveBeenCalled()
  })
  it('saves once on repeated submission and normalizes values', async () => {
    const user = userEvent.setup(),
      save = vi.fn<(customer: Customer) => void>(),
      close = vi.fn<() => void>()
    render(<CustomerForm existing={[]} onSave={save} onClose={close} />)
    await user.type(screen.getByLabelText('Full name'), '  Ali Raza  ')
    await user.type(screen.getByLabelText('Email address'), 'ALI@example.com')
    await user.type(screen.getByLabelText('City'), '  Lahore  ')
    await user.dblClick(screen.getByRole('button', { name: 'Add customer' }))
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
    expect(save.mock.calls[0][0]).toMatchObject({
      name: 'Ali Raza',
      email: 'ali@example.com',
      city: 'Lahore',
      orders: 0,
    })
    expect(close).toHaveBeenCalledTimes(1)
  })
  it('drops a pending save when the form is closed before it finishes', async () => {
    const user = userEvent.setup(),
      save = vi.fn<(customer: Customer) => void>()
    const { unmount } = render(
      <CustomerForm existing={[]} onSave={save} onClose={vi.fn<() => void>()} />,
    )
    await user.type(screen.getByLabelText('Full name'), 'Sara Malik')
    await user.type(screen.getByLabelText('Email address'), 'sara@example.com')
    await user.type(screen.getByLabelText('City'), 'Multan')
    await user.click(screen.getByRole('button', { name: 'Add customer' }))
    unmount()
    await new Promise((resolve) => setTimeout(resolve, 600))
    expect(save).not.toHaveBeenCalled()
  })
})
