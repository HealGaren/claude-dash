import type { Category, Session } from '@cdash/shared'

import { mockCategories, mockSessions } from './mockData'
import type { CursorResponse, PaginatedResponse } from './types'

const MOCK_DELAY_MS = { min: 300, max: 500 }

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay(): number {
  return MOCK_DELAY_MS.min + Math.random() * (MOCK_DELAY_MS.max - MOCK_DELAY_MS.min)
}

export async function fetchSessions(): Promise<Session[]> {
  await delay(randomDelay())
  return mockSessions
}

export async function fetchSessionsPaginated(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Session>> {
  await delay(randomDelay())
  const totalCount = mockSessions.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const start = (page - 1) * pageSize
  const items = mockSessions.slice(start, start + pageSize)
  return { items, totalCount, page, pageSize, totalPages }
}

export async function fetchSessionsInfinite(
  cursor: string | null,
  limit: number,
): Promise<CursorResponse<Session>> {
  await delay(randomDelay())
  const startIndex = cursor ? mockSessions.findIndex((s) => s.id === cursor) + 1 : 0
  const items = mockSessions.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < mockSessions.length
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null
  return { items, nextCursor }
}

export async function fetchCategories(): Promise<Category[]> {
  await delay(randomDelay())
  return mockCategories
}
