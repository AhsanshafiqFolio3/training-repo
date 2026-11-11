import { Component } from 'react'
import type { ComponentType, ReactNode } from 'react'

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
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }
  reset = (): void => {
    this.setState({ failed: false })
  }
  render(): ReactNode {
    const Fallback = this.props.fallback
    return this.state.failed ? <Fallback reset={this.reset} /> : this.props.children
  }
}
