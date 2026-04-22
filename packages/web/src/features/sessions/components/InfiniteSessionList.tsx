import { ViewportSentinel } from '@/components/ViewportSentinel'

import { useInfiniteSessions } from '../hooks/useInfiniteSessions'
import { SessionGrid } from './SessionGrid'

const PAGE_SIZE = 6

export const InfiniteSessionList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useInfiniteSessions(PAGE_SIZE)

  const sessions = data.pages.flatMap((page) => page.items)

  const handleIntersect = () => {
    void fetchNextPage()
  }

  return (
    <div className="flex flex-col gap-6">
      <SessionGrid sessions={sessions} />
      <InfiniteLoadStatus
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        error={error}
        onRetry={handleIntersect}
      />
      <ViewportSentinel
        onIntersect={handleIntersect}
        disabled={!hasNextPage || isFetchingNextPage || error !== null}
      />
    </div>
  )
}

interface InfiniteLoadStatusProps {
  isFetchingNextPage: boolean
  hasNextPage: boolean
  error: Error | null
  onRetry: () => void
}

const InfiniteLoadStatus = ({
  isFetchingNextPage,
  hasNextPage,
  error,
  onRetry,
}: InfiniteLoadStatusProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-10 items-center justify-center text-sm text-muted-foreground"
    >
      {error ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md px-3 py-1 text-destructive hover:bg-destructive/10"
        >
          불러오기에 실패했습니다. 다시 시도
        </button>
      ) : isFetchingNextPage ? (
        <span>다음 세션 불러오는 중…</span>
      ) : !hasNextPage ? (
        <span>모든 세션을 불러왔습니다</span>
      ) : null}
    </div>
  )
}
