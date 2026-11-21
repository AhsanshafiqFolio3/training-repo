import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

type NotFoundContentProps = {
  title?: string
}

// Used for unknown URLs and for API 404s (a product or order that doesn't exist).
export function NotFoundContent({
  title = 'This page wandered off.',
}: NotFoundContentProps): ReactElement {
  return (
    <div className="not-found">
      <title>Not found · The Bug Bazaar</title>
      <span className="eyebrow">404 / NOT FOUND</span>
      <h1>{title}</h1>
      <p>We couldn’t find what you were looking for. Let’s get you back to the shop.</p>
      <Link className="button dark" to="/">
        Back to the shop <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </div>
  )
}

export function NotFoundPage(): ReactElement {
  return (
    <main className="page-container">
      <NotFoundContent />
    </main>
  )
}
