import { useEffect } from 'react'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { sessionKeys } from '../api/queryKeys'
import { fetchSessionsPaginated } from '../api/sessionsApi'

export function usePaginatedSessions(page: number, pageSize: number) {
  const queryClient = useQueryClient()

  const result = useSuspenseQuery({
    queryKey: sessionKeys.list({ page, pageSize }),
    queryFn: () => fetchSessionsPaginated(page, pageSize),
  })

  const { totalPages } = result.data

  // 다음 페이지 프리페치로 깜빡임 방지
  useEffect(() => {
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: sessionKeys.list({ page: page + 1, pageSize }),
        queryFn: () => fetchSessionsPaginated(page + 1, pageSize),
      })
    }
  }, [queryClient, page, pageSize, totalPages])

  return result
}
