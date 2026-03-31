import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import type { Category, Session } from '@cdash/shared'

import { SessionCard } from './SessionCard'

const mockCategory: Category = {
  id: 'feature',
  name: 'Feature',
  color: '#6366f1',
  icon: '🚀',
}

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

describe('SessionCard', () => {
  it('세션 제목과 카테고리를 표시한다', () => {
    render(<SessionCard session={createSession()} category={mockCategory} />)
    expect(screen.getByText('테스트 세션')).toBeInTheDocument()
    expect(screen.getByText(/Feature/)).toBeInTheDocument()
  })

  it('상태별 인디케이터를 렌더링한다', () => {
    const { container } = render(
      <SessionCard session={createSession({ status: 'running' })} category={mockCategory} />,
    )
    const indicator = container.querySelector('[aria-label="처리중"]')
    expect(indicator).toBeInTheDocument()
  })

  it('done 상태에서 체크마크를 렌더링한다', () => {
    const { container } = render(
      <SessionCard session={createSession({ status: 'done' })} category={mockCategory} />,
    )
    const indicator = container.querySelector('[aria-label="완료"]')
    expect(indicator).toBeInTheDocument()
    expect(indicator?.querySelector('svg')).toBeInTheDocument()
  })

  it('카테고리가 없어도 렌더링된다', () => {
    render(<SessionCard session={createSession()} category={undefined} />)
    expect(screen.getByText('테스트 세션')).toBeInTheDocument()
  })
})
