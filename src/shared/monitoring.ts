// Error logging. Everything unexpected ends up in reportError(): render crashes (from
// ErrorBoundary) and errors no one caught (from the window listeners below).
// Today it writes to the console and keeps the last few in memory. In production this is
// the one place to send them to an error tracker such as Sentry (see docs/monitoring.md).

export type ErrorSource = 'render' | 'uncaught' | 'unhandled-promise'

export type ErrorReport = {
  source: ErrorSource
  message: string
  // Which page the user was on.
  path: string
  time: string
  stack?: string
  // For render errors: which components the error passed through.
  componentStack?: string
}

const MAX_KEPT = 20
const recentReports: ErrorReport[] = []

function messageOf(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return typeof error === 'string' ? error : 'Unknown error'
}

export function reportError(
  error: unknown,
  source: ErrorSource,
  componentStack?: string,
): ErrorReport {
  const report: ErrorReport = {
    source,
    message: messageOf(error),
    path: window.location.pathname,
    time: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined,
    componentStack,
  }
  recentReports.push(report)
  if (recentReports.length > MAX_KEPT) recentReports.shift()
  console.error('[bug-bazaar] error report', report)
  return report
}

// The last few reports, oldest first. Handy in tests and when debugging in the console.
export function readErrorReports(): readonly ErrorReport[] {
  return recentReports
}

export function clearErrorReports(): void {
  recentReports.length = 0
}

function logUncaughtError(event: ErrorEvent): void {
  reportError(event.error ?? event.message, 'uncaught')
}

function logUnhandledRejection(event: PromiseRejectionEvent): void {
  reportError(event.reason, 'unhandled-promise')
}

// Catches what React's error boundaries can't: errors in event handlers, timers and
// promises nobody awaited. Returns a function that removes the listeners again.
export function listenForUncaughtErrors(): () => void {
  window.addEventListener('error', logUncaughtError)
  window.addEventListener('unhandledrejection', logUnhandledRejection)
  return () => {
    window.removeEventListener('error', logUncaughtError)
    window.removeEventListener('unhandledrejection', logUnhandledRejection)
  }
}
