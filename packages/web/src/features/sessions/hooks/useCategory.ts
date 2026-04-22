import { useCategories } from './useCategories'

export function useCategory(id: string) {
  const { data: categories } = useCategories()
  return categories.find((c) => c.id === id)
}
