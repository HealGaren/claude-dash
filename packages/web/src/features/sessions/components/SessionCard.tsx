import type { Session } from '@cdash/shared'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useCategory } from '../hooks/useCategory'
import { SessionStatusIndicator } from './SessionStatusIndicator'

interface SessionCardProps {
  session: Session
}

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const category = useCategory(session.categoryId)

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <SessionStatusIndicator status={session.status} />
          <CardTitle className="truncate">{session.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {category ? (
            <Badge variant="outline" style={{ borderColor: category.color, color: category.color }}>
              {category.icon} {category.name}
            </Badge>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(session.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
