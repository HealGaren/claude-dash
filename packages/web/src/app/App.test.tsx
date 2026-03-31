import { describe, expect, it } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { App } from './App'

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  it('세션 페이지 타이틀을 렌더링한다', () => {
    renderWithProviders()
    expect(screen.getByText('세션')).toBeInTheDocument()
  })
})
