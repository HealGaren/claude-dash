import { useEffect, useRef } from 'react'

interface IntersectionTriggerProps {
  onEnter: () => void
  disabled?: boolean
  rootMargin?: string
}

export const IntersectionTrigger = ({
  onEnter,
  disabled = false,
  rootMargin = '200px',
}: IntersectionTriggerProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onEnter()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onEnter, disabled, rootMargin])

  return <div ref={ref} aria-hidden="true" />
}
