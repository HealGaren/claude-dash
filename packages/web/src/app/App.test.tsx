import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import { App } from './App'

describe('App', () => {
  it('cdash 타이틀을 렌더링한다', () => {
    render(<App />)
    expect(screen.getByText('cdash')).toBeInTheDocument()
  })
})
