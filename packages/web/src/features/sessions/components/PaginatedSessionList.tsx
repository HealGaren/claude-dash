import { useState } from 'react'

import { useCategories } from '../hooks/useCategories'
import { usePaginatedSessions } from '../hooks/usePaginatedSessions'
import { PaginationControls } from './PaginationControls'
import { SessionCard } from './SessionCard'

const PAGE_SIZE = 6

export const PaginatedSessionList = () => {
  const [page, setPage] = useState(1)
  const { data } = usePaginatedSessions(page, PAGE_SIZE)
  const { data: categories } = useCategories()

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            category={categoryMap.get(session.categoryId)}
          />
        ))}
      </div>
      <PaginationControls page={page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  )
}
