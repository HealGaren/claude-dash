import type { FallbackProps } from 'react-error-boundary'

import type { Session } from '@cdash/shared'

import { SuspenseBoundary } from '@/components/SuspenseBoundary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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

const SessionCardSkeleton = () => (
  <Card size="sm">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="size-2.5 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    </CardContent>
  </Card>
)

const SessionCardError = ({ error, resetErrorBoundary }: FallbackProps) => (
  <Card size="sm">
    <CardContent>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{error.message}</p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          재시도
        </Button>
      </div>
    </CardContent>
  </Card>
)

// 카테고리 캐시가 외부에서 reset/remove되어도 카드 단위로만 fallback이 뜨도록
// 경계를 카드 안쪽에 둔다. 상위 리스트/스크롤 위치가 보존됨.
export const SessionCard = ({ session }: SessionCardProps) => {
  return (
    <SuspenseBoundary pendingFallback={<SessionCardSkeleton />} ErrorFallback={SessionCardError}>
      <SessionCardContent session={session} />
    </SuspenseBoundary>
  )
}

const SessionCardContent = ({ session }: SessionCardProps) => {
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
