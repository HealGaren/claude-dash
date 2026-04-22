import { useEffect, useRef } from 'react'

interface ViewportSentinelProps {
  onIntersect: () => void
  disabled?: boolean
  preloadDistance?: number
}

export const ViewportSentinel = ({
  onIntersect,
  disabled = false,
  preloadDistance = 200,
}: ViewportSentinelProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || disabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onIntersect()
        }
      },
      { rootMargin: `${preloadDistance}px` },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect, disabled, preloadDistance])

  return <div ref={sentinelRef} aria-hidden="true" />
}
