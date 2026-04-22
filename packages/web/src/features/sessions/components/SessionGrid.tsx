import type { Session } from '@cdash/shared'

import { SessionCard } from './SessionCard'

interface SessionGridProps {
  sessions: Session[]
}

export const SessionGrid = ({ sessions }: SessionGridProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}
