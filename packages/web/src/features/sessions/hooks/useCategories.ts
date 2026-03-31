import { useSuspenseQuery } from '@tanstack/react-query'

import { fetchCategories } from '../api/sessionsApi'

export function useCategories() {
  return useSuspenseQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}
