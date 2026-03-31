import { describe, expect, it } from 'vitest'

describe('shared', () => {
  it('모듈을 import할 수 있다', async () => {
    const mod = await import('./index')
    expect(mod).toBeDefined()
  })
})
