import { useEffect } from 'react'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import type { Session } from '@cdash/shared'

import { sessionKeys } from '../api/queryKeys'
import type { PaginatedResponse } from '../api/sessionsApi'
import { fetchSessionsPaginated } from '../api/sessionsApi'

export function usePaginatedSessions(page: number, pageSize: number) {
  const queryClient = useQueryClient()

  // 다음 페이지 프리페치로 깜빡임 방지
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: sessionKeys.list({ page: page + 1, pageSize }),
      queryFn: () => fetchSessionsPaginated(page + 1, pageSize),
    })
  }, [queryClient, page, pageSize])

  return useSuspenseQuery<
    PaginatedResponse<Session>,
    Error,
    PaginatedResponse<Session>,
    ReturnType<typeof sessionKeys.list>
  >({
    queryKey: sessionKeys.list({ page, pageSize }),
    queryFn: () => fetchSessionsPaginated(page, pageSize),
  })
}
