import { describe, expect, it, vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Session } from '@cdash/shared'

import { mockCategories, mockSessions } from '@/features/sessions/api/mockData'
import type { PaginatedResponse } from '@/features/sessions/api/types'

const { mockFetchSessionsPaginated, mockFetchCategories } = vi.hoisted(() => ({
  mockFetchSessionsPaginated: vi.fn<(page: number, pageSize: number) => Promise<unknown>>(),
  mockFetchCategories: vi.fn<() => Promise<unknown>>(),
}))

vi.mock('@/features/sessions/api/sessionsApi', async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>
  return {
    ...original,
    fetchSessionsPaginated: mockFetchSessionsPaginated,
    fetchCategories: mockFetchCategories,
  }
})

function makePaginatedResponse(page: number, pageSize: number): PaginatedResponse<Session> {
  const totalCount = mockSessions.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const start = (page - 1) * pageSize
  const items = mockSessions.slice(start, start + pageSize)
  return { items, totalCount, page, pageSize, totalPages }
}

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardSessionsPage />
    </QueryClientProvider>,
  )
}

// dynamic import after mock setup
const { DashboardSessionsPage } = await import('./DashboardSessionsPage')

describe('DashboardSessionsPage', () => {
  it('로딩 스켈레톤 후 첫 페이지 세션을 표시한다', async () => {
    mockFetchSessionsPaginated.mockImplementation((page: number, pageSize: number) =>
      Promise.resolve(makePaginatedResponse(page, pageSize)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)
    renderWithProviders()

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.getByText('대시보드 세션 목록 UI 구현')).toBeInTheDocument()
    })

    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  it('에러 발생 시 에러 메시지와 다시 시도 버튼을 표시한다', async () => {
    mockFetchSessionsPaginated.mockRejectedValue(new Error('네트워크 오류'))
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('네트워크 오류')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('다시 시도 버튼을 누르면 재요청한다', async () => {
    const user = userEvent.setup()
    mockFetchSessionsPaginated.mockRejectedValue(new Error('일시적 오류'))
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('일시적 오류')).toBeInTheDocument()
    })

    mockFetchSessionsPaginated.mockImplementation((page: number, pageSize: number) =>
      Promise.resolve(makePaginatedResponse(page, pageSize)),
    )

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByText('대시보드 세션 목록 UI 구현')).toBeInTheDocument()
    })
  })

  it('다음 버튼으로 페이지를 전환할 수 있다', async () => {
    const user = userEvent.setup()
    mockFetchSessionsPaginated.mockImplementation((page: number, pageSize: number) =>
      Promise.resolve(makePaginatedResponse(page, pageSize)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('1 / 4')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '다음' }))

    await waitFor(() => {
      expect(screen.getByText('2 / 4')).toBeInTheDocument()
    })
  })

  it('첫 페이지에서 이전 버튼이 비활성화된다', async () => {
    mockFetchSessionsPaginated.mockImplementation((page: number, pageSize: number) =>
      Promise.resolve(makePaginatedResponse(page, pageSize)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('1 / 4')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: '이전' })).toBeDisabled()
  })

  it('마지막 페이지에서 다음 버튼이 비활성화된다', async () => {
    // pageSize를 전체 데이터 수와 같게 설정해 1페이지 = 마지막 페이지가 되게 함
    mockFetchSessionsPaginated.mockImplementation((_page: number, _pageSize: number) =>
      Promise.resolve(makePaginatedResponse(1, mockSessions.length)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('1 / 1')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('무한스크롤 탭에 준비 중 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockFetchSessionsPaginated.mockImplementation((page: number, pageSize: number) =>
      Promise.resolve(makePaginatedResponse(page, pageSize)),
    )
    mockFetchCategories.mockResolvedValue(mockCategories)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('대시보드 세션 목록 UI 구현')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('tab', { name: '무한스크롤' }))

    await waitFor(() => {
      expect(screen.getByText('무한스크롤 — 준비 중')).toBeInTheDocument()
    })
  })
})
