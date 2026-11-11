import type { CustomerDraft, ValidationErrors } from '../../shared/types'

export function validateCustomer(draft: CustomerDraft): ValidationErrors {
  const errors: ValidationErrors = {}
  if (draft.name.trim().length < 2 || draft.name.trim().length > 80)
    errors.name = 'Enter a name between 2 and 80 characters.'
  if (draft.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
    errors.email = 'Enter a valid email address.'
  if (draft.city.trim().length < 2 || draft.city.trim().length > 80)
    errors.city = 'Enter a city between 2 and 80 characters.'
  return errors
}
