import type { ReactNode } from 'react'
import { Suspense } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'

interface SuspenseBoundaryProps {
  children: ReactNode
  pendingFallback: ReactNode
  ErrorFallback: (props: FallbackProps) => ReactNode
  onReset?: () => void
}

export const SuspenseBoundary = ({
  children,
  pendingFallback,
  ErrorFallback,
  onReset,
}: SuspenseBoundaryProps) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={onReset}>
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}
