import { describe, expect, it, vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mockSessions } from '@/features/sessions/api/mockData'

import { DashboardSessionsPage } from './DashboardSessionsPage'

const { mockFetchSessions } = vi.hoisted(() => ({
  mockFetchSessions: vi.fn<() => Promise<unknown>>(),
}))

vi.mock('@/features/sessions/api/sessionsApi', async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>
  return {
    ...original,
    fetchSessions: mockFetchSessions,
  }
})

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

describe('DashboardSessionsPage', () => {
  it('로딩 스켈레톤 후 세션 목록을 표시한다', async () => {
    mockFetchSessions.mockResolvedValue(mockSessions)
    renderWithProviders()

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.getByText('대시보드 세션 목록 UI 구현')).toBeInTheDocument()
    })
  })

  it('에러 발생 시 에러 메시지와 다시 시도 버튼을 표시한다', async () => {
    mockFetchSessions.mockRejectedValue(new Error('네트워크 오류'))

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('네트워크 오류')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('다시 시도 버튼을 누르면 재요청한다', async () => {
    const user = userEvent.setup()
    mockFetchSessions.mockRejectedValue(new Error('일시적 오류'))

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('일시적 오류')).toBeInTheDocument()
    })

    mockFetchSessions.mockResolvedValue(mockSessions)

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(screen.getByText('대시보드 세션 목록 UI 구현')).toBeInTheDocument()
    })
  })
})
