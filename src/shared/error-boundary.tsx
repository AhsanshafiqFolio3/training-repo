import { Component } from 'react'
import type { ComponentType, ErrorInfo, ReactNode } from 'react'
import { reportError } from './monitoring'

export interface ErrorFallbackProps {
  reset: () => void
}
interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ComponentType<ErrorFallbackProps>
}
interface ErrorBoundaryState {
  failed: boolean
}

// Catches errors thrown while rendering anything inside it. Instead of the whole app
// going blank, it shows the fallback screen and logs the error.
// It has to be a class: React has no hook for catching render errors.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  // Runs during rendering: switch to the fallback.
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  // Runs after the fallback is on screen: the place for side effects such as logging.
  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, 'render', info.componentStack ?? undefined)
  }

  reset = (): void => {
    this.setState({ failed: false })
  }

  render(): ReactNode {
    const Fallback = this.props.fallback
    return this.state.failed ? <Fallback reset={this.reset} /> : this.props.children
  }
}
