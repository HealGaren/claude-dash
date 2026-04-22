import { useState } from 'react'

import { usePaginatedSessions } from '../hooks/usePaginatedSessions'
import { PaginationControls } from './PaginationControls'
import { SessionGrid } from './SessionGrid'

const PAGE_SIZE = 6

export const PaginatedSessionList = () => {
  const [page, setPage] = useState(1)
  const { data } = usePaginatedSessions(page, PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <SessionGrid sessions={data.items} />
      <PaginationControls page={page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  )
}
