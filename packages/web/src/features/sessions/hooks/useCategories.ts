import { useSuspenseQuery } from '@tanstack/react-query'

import { categoryKeys } from '../api/queryKeys'
import { fetchCategories } from '../api/sessionsApi'

export function useCategories() {
  return useSuspenseQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  })
}
