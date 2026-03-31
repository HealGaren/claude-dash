import type { Category, Session } from '@cdash/shared'

import { mockCategories, mockSessions } from './mockData'

const MOCK_DELAY_MS = { min: 300, max: 500 }

/** 에러 시뮬레이션용 — true로 바꾸면 fetchSessions가 실패 */
export const MOCK_ERROR = false

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay(): number {
  return MOCK_DELAY_MS.min + Math.random() * (MOCK_DELAY_MS.max - MOCK_DELAY_MS.min)
}

export async function fetchSessions(): Promise<Session[]> {
  await delay(randomDelay())
  if (MOCK_ERROR) {
    throw new Error('세션 목록을 불러오는 데 실패했습니다.')
  }
  return mockSessions
}

export async function fetchCategories(): Promise<Category[]> {
  await delay(randomDelay())
  return mockCategories
}
