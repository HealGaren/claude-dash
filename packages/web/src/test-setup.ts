import { afterEach } from 'vitest'

import { cleanup } from '@testing-library/react'

import '@testing-library/jest-dom/vitest'

// jsdom에는 IntersectionObserver가 없다. 테스트에서 수동으로 교차를 트리거할 수 있도록
// 인스턴스를 레지스트리에 모아두고 helper로 발동한다.
type MockObserverEntry = {
  observer: IntersectionObserver
  callback: IntersectionObserverCallback
  targets: Set<Element>
}

const intersectionObserverRegistry: MockObserverEntry[] = []

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  private readonly entry: MockObserverEntry

  constructor(callback: IntersectionObserverCallback) {
    this.entry = { observer: this, callback, targets: new Set() }
    intersectionObserverRegistry.push(this.entry)
  }

  observe(target: Element): void {
    this.entry.targets.add(target)
  }

  unobserve(target: Element): void {
    this.entry.targets.delete(target)
  }

  disconnect(): void {
    this.entry.targets.clear()
    const index = intersectionObserverRegistry.indexOf(this.entry)
    if (index >= 0) intersectionObserverRegistry.splice(index, 1)
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

export function triggerIntersection(isIntersecting = true): void {
  for (const entry of intersectionObserverRegistry) {
    const records: IntersectionObserverEntry[] = Array.from(entry.targets).map(
      (target) =>
        ({
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        }) as IntersectionObserverEntry,
    )
    entry.callback(records, entry.observer)
  }
}

afterEach(() => {
  cleanup()
  intersectionObserverRegistry.length = 0
})
