import { useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Modal } from './Modal'

function Harness(): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open modal</button>
      {open && (
        <Modal title="Edit details" onClose={() => setOpen(false)}>
          <input aria-label="Name" data-autofocus />
          <button>Save</button>
        </Modal>
      )}
    </>
  )
}
it('focuses the input, traps both tab directions, closes with Escape and restores the trigger', async () => {
  const user = userEvent.setup()
  render(<Harness />)
  const trigger = screen.getByRole('button', { name: 'Open modal' })
  await user.click(trigger)
  expect(screen.getByRole('dialog', { name: 'Edit details' })).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus()
  await user.tab({ shift: true })
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})
function DisablingHarness(): ReactElement {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  return (
    <>
      <h2 ref={heading} tabIndex={-1}>
        Your bag
      </h2>
      <button disabled={done} onClick={() => setOpen(true)}>
        Review order
      </button>
      {open && (
        <Modal title="Checkout" fallbackFocus={heading} onClose={() => setOpen(false)}>
          <button onClick={() => setDone(true)}>Place order</button>
        </Modal>
      )}
    </>
  )
}
it('moves focus to the fallback when the trigger is disabled while the modal is open', async () => {
  const user = userEvent.setup()
  render(<DisablingHarness />)
  await user.click(screen.getByRole('button', { name: 'Review order' }))
  await user.click(screen.getByRole('button', { name: 'Place order' }))
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Your bag' })).toHaveFocus()
})
