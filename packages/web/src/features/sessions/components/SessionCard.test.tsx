import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import type { Category, Session } from '@cdash/shared'

import { SessionCard } from './SessionCard'

const mockCategory: Category = {
  id: 'feature',
  name: 'Feature',
  color: '#6366f1',
  icon: '🚀',
}

const { mockFetchCategories } = vi.hoisted(() => ({
  mockFetchCategories: vi.fn<() => Promise<Category[]>>(),
}))

vi.mock('@/features/sessions/api/sessionsApi', async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>
  return {
    ...original,
    fetchCategories: mockFetchCategories,
  }
})

function createSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1',
    title: '테스트 세션',
    categoryId: 'feature',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function renderCard(session: Session) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <SessionCard session={session} />
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('SessionCard', () => {
  it('세션 제목과 카테고리를 표시한다', async () => {
    mockFetchCategories.mockResolvedValue([mockCategory])
    renderCard(createSession())

    await waitFor(() => {
      expect(screen.getByText('테스트 세션')).toBeInTheDocument()
    })
    expect(screen.getByText(/Feature/)).toBeInTheDocument()
  })

  it('상태별 인디케이터를 렌더링한다', async () => {
    mockFetchCategories.mockResolvedValue([mockCategory])
    const { container } = renderCard(createSession({ status: 'running' }))

    await waitFor(() => {
      expect(screen.getByText('테스트 세션')).toBeInTheDocument()
    })
    const indicator = container.querySelector('[aria-label="처리중"]')
    expect(indicator).toBeInTheDocument()
  })

  it('done 상태에서 체크마크를 렌더링한다', async () => {
    mockFetchCategories.mockResolvedValue([mockCategory])
    const { container } = renderCard(createSession({ status: 'done' }))

    await waitFor(() => {
      expect(screen.getByText('테스트 세션')).toBeInTheDocument()
    })
    const indicator = container.querySelector('[aria-label="완료"]')
    expect(indicator).toBeInTheDocument()
    expect(indicator?.querySelector('svg')).toBeInTheDocument()
  })

  it('매칭되는 카테고리가 없어도 렌더링된다', async () => {
    mockFetchCategories.mockResolvedValue([])
    renderCard(createSession())

    await waitFor(() => {
      expect(screen.getByText('테스트 세션')).toBeInTheDocument()
    })
  })
})
