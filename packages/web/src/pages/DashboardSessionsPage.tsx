import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sessionKeys } from '@/features/sessions/api/queryKeys'
import { PaginatedSessionList } from '@/features/sessions/components/PaginatedSessionList'

const SessionListSkeleton = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const SessionListError = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        다시 시도
      </Button>
    </div>
  )
}

export const DashboardSessionsPage = () => {
  const queryClient = useQueryClient()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">세션</h1>
      <Tabs defaultValue="paginated">
        <TabsList>
          <TabsTrigger value="paginated">페이지네이션</TabsTrigger>
          <TabsTrigger value="infinite">무한스크롤</TabsTrigger>
        </TabsList>
        <TabsContent value="paginated">
          <ErrorBoundary
            FallbackComponent={SessionListError}
            onReset={() => {
              queryClient.resetQueries({ queryKey: sessionKeys.all })
            }}
          >
            <Suspense fallback={<SessionListSkeleton />}>
              <PaginatedSessionList />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="infinite">
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">무한스크롤 — 준비 중</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
