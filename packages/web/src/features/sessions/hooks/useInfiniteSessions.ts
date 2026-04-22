import { useSuspenseInfiniteQuery } from '@tanstack/react-query'

import { sessionKeys } from '../api/queryKeys'
import { fetchSessionsInfinite } from '../api/sessionsApi'

// useSuspenseInfiniteQuery는 기본적으로 "데이터 없을 때만 throw"라서
// 초기 로드 실패는 ErrorBoundary로 올라가고, 추가 로드 실패는 result.error로 유지된다.
export function useInfiniteSessions(pageSize: number) {
  return useSuspenseInfiniteQuery({
    queryKey: sessionKeys.infinite({ pageSize }),
    queryFn: ({ pageParam }) => fetchSessionsInfinite(pageParam, pageSize),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
