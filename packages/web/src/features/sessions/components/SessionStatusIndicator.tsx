import type { SessionStatus } from '@cdash/shared'

import { cn } from '@/lib/utils'

interface SessionStatusIndicatorProps {
  status: SessionStatus
}

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
  running: {
    label: '처리중',
    className: 'bg-emerald-500 animate-[status-pulse_2s_ease-in-out_infinite]',
  },
  ready: {
    label: '입력 대기',
    className: 'bg-amber-400 animate-[status-blink_1.5s_ease-in-out_infinite]',
  },
  idle: {
    label: '유휴',
    className: 'bg-muted-foreground/50',
  },
  off: {
    label: '꺼짐',
    className: 'border border-muted-foreground/50 bg-transparent',
  },
  done: {
    label: '완료',
    className: 'bg-emerald-500/80',
  },
}

export const SessionStatusIndicator = ({ status }: SessionStatusIndicatorProps) => {
  const config = statusConfig[status]

  if (status === 'done') {
    return (
      <span
        className="flex size-3 items-center justify-center text-emerald-500"
        title={config.label}
        aria-label={config.label}
      >
        <svg viewBox="0 0 12 12" fill="none" className="size-3" aria-hidden="true">
          <path
            d="M2.5 6L5 8.5L9.5 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  return (
    <span
      className={cn('block size-2.5 rounded-full', config.className)}
      title={config.label}
      aria-label={config.label}
    />
  )
}
