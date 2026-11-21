import type { ReactElement } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type PaginationProps = {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageCount, onChange }: PaginationProps): ReactElement | null {
  if (pageCount <= 1) return null

  return (
    <nav className="pagination" aria-label="Pages">
      <button
        type="button"
        className="button secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeft size={15} aria-hidden="true" /> Previous
      </button>
      <span>
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        className="button secondary"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Next <ArrowRight size={15} aria-hidden="true" />
      </button>
    </nav>
  )
}
