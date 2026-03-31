import type { Category, Session } from '@cdash/shared'

import { mockCategories, mockSessions } from './mockData'

const MOCK_DELAY_MS = { min: 300, max: 500 }

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay(): number {
  return MOCK_DELAY_MS.min + Math.random() * (MOCK_DELAY_MS.max - MOCK_DELAY_MS.min)
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
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

export async function fetchCategories(): Promise<Category[]> {
  await delay(randomDelay())
  return mockCategories
}
