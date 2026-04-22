import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import type { Session } from '@cdash/shared'

import { SuspenseBoundary } from '@/components/SuspenseBoundary'
import { mockCategories, mockSessions } from '@/features/sessions/api/mockData'
import type { CursorResponse } from '@/features/sessions/api/types'
import { triggerIntersection } from '@/test-setup'

const { mockFetchSessionsInfinite, mockFetchCategories } = vi.hoisted(() => ({
  mockFetchSessionsInfinite: vi.fn<(cursor: string | null, limit: number) => Promise<unknown>>(),
  mockFetchCategories: vi.fn<() => Promise<unknown>>(),
}))

vi.mock('@/features/sessions/api/sessionsApi', async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>
  return {
    ...original,
    fetchSessionsInfinite: mockFetchSessionsInfinite,
    fetchCategories: mockFetchCategories,
  }
})

function makeCursorResponse(cursor: string | null, limit: number): CursorResponse<Session> {
  const startIndex = cursor ? mockSessions.findIndex((s) => s.id === cursor) + 1 : 0
  const items = mockSessions.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < mockSessions.length
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null
  return { items, nextCursor }
}

function renderList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <SuspenseBoundary
        pendingFallback={<div data-testid="initial-fallback" />}
        ErrorFallback={({ error }) => <div data-testid="error-fallback">{error.message}</div>}
      >
        <InfiniteSessionList />
      </SuspenseBoundary>
    </QueryClientProvider>,
  )
}

const { InfiniteSessionList } = await import('./InfiniteSessionList')

describe('InfiniteSessionList', () => {
  it('초기 로드 후 첫 페이지 세션이 표시된다', async () => {
    mockFetchSessionsInfinite.mockImplementation((cursor: string | null, limit: number) =>
      Promise.resolve(makeCursorResponse(cursor, limit)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderList()

    await waitFor(() => {
      expect(screen.getByText(mockSessions[0].title)).toBeInTheDocument()
    })
    expect(screen.queryByText(mockSessions[6].title)).not.toBeInTheDocument()
  })

  it('트리거가 발동되면 다음 페이지가 이어 붙고 기존 카드는 유지된다', async () => {
    mockFetchSessionsInfinite.mockImplementation((cursor: string | null, limit: number) =>
      Promise.resolve(makeCursorResponse(cursor, limit)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderList()

    await waitFor(() => {
      expect(screen.getByText(mockSessions[0].title)).toBeInTheDocument()
    })

    // 초기 로드 후 전체 fallback이 사라졌는지 확인 = 추가 로드에 Suspense가 걸리지 않음
    expect(screen.queryByTestId('initial-fallback')).not.toBeInTheDocument()

    act(() => {
      triggerIntersection(true)
    })

    await waitFor(() => {
      expect(screen.getByText(mockSessions[6].title)).toBeInTheDocument()
    })
    // 기존 카드가 DOM에서 빠지지 않았는지 = 상단 깜빡임 없음
    expect(screen.getByText(mockSessions[0].title)).toBeInTheDocument()
    // 추가 로드 중에도 전체 fallback은 다시 뜨지 않음
    expect(screen.queryByTestId('initial-fallback')).not.toBeInTheDocument()
  })

  it('마지막 페이지 도달 시 트리거가 멈추고 완료 메시지를 표시한다', async () => {
    mockFetchSessionsInfinite.mockImplementation((cursor: string | null, limit: number) =>
      Promise.resolve(makeCursorResponse(cursor, limit)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderList()

    await waitFor(() => {
      expect(screen.getByText(mockSessions[0].title)).toBeInTheDocument()
    })

    // 총 세션 수만큼 페이지를 끝까지 당긴다 (PAGE_SIZE=6 기준 넉넉히 반복)
    const totalPages = Math.ceil(mockSessions.length / 6)
    for (let i = 0; i < totalPages + 2; i++) {
      act(() => {
        triggerIntersection(true)
      })
      await waitFor(() => {
        expect(mockFetchSessionsInfinite).toHaveBeenCalled()
      })
    }

    await waitFor(() => {
      expect(screen.getByText('모든 세션을 불러왔습니다')).toBeInTheDocument()
    })

    const callsAtEnd = mockFetchSessionsInfinite.mock.calls.length
    act(() => {
      triggerIntersection(true)
    })
    // 이미 마지막 페이지라 추가 fetch가 일어나지 않아야 함
    expect(mockFetchSessionsInfinite.mock.calls.length).toBe(callsAtEnd)
  })

  it('초기 로드 에러 시 외부 ErrorBoundary fallback이 뜬다', async () => {
    mockFetchSessionsInfinite.mockRejectedValue(new Error('네트워크 오류'))
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderList()

    await waitFor(() => {
      expect(screen.getByTestId('error-fallback')).toHaveTextContent('네트워크 오류')
    })
  })
})
