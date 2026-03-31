import { useSuspenseQuery } from '@tanstack/react-query'

import { sessionKeys } from '../api/queryKeys'
import { fetchSessions } from '../api/sessionsApi'

export function useSessions() {
  return useSuspenseQuery({
    queryKey: sessionKeys.lists(),
    queryFn: fetchSessions,
  })
}
