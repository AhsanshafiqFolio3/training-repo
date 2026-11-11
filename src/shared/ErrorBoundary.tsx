import { Component } from 'react'
import type { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: (reset: () => void) => ReactNode
}
interface ErrorBoundaryState {
  failed: boolean
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }
  reset = (): void => {
    this.setState({ failed: false })
  }
  render(): ReactNode {
    return this.state.failed ? this.props.fallback(this.reset) : this.props.children
  }
}
