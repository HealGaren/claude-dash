import type { Session } from '@cdash/shared'

import { useCategories } from '../hooks/useCategories'
import { SessionCard } from './SessionCard'

interface SessionGridProps {
  sessions: Session[]
}

export const SessionGrid = ({ sessions }: SessionGridProps) => {
  const { data: categories } = useCategories()
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          category={categoryMap.get(session.categoryId)}
        />
      ))}
    </div>
  )
}
