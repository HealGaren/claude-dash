import type { Category, Session } from '@cdash/shared'

export const mockCategories: Category[] = [
  { id: 'feature', name: 'Feature', color: '#6366f1', icon: '🚀' },
  { id: 'bugfix', name: 'Bugfix', color: '#ef4444', icon: '🐛' },
  { id: 'refactor', name: 'Refactoring', color: '#f59e0b', icon: '🔧' },
  { id: 'qa', name: 'Q&A', color: '#06b6d4', icon: '💬' },
  { id: 'daily', name: 'Daily', color: '#8b5cf6', icon: '📋' },
]

const now = new Date()

function hoursAgo(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
}

function minutesAgo(minutes: number): string {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString()
}

function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

export const mockSessions: Session[] = [
  // running
  {
    id: 's1',
    title: '대시보드 세션 목록 UI 구현',
    categoryId: 'feature',
    status: 'running',
    createdAt: hoursAgo(2),
    updatedAt: minutesAgo(1),
  },
  {
    id: 's2',
    title: 'WebSocket 실시간 상태 동기화',
    categoryId: 'feature',
    status: 'running',
    createdAt: hoursAgo(1),
    updatedAt: minutesAgo(3),
  },
  // ready
  {
    id: 's3',
    title: '로그인 페이지 리디자인',
    categoryId: 'feature',
    status: 'ready',
    createdAt: hoursAgo(4),
    updatedAt: minutesAgo(5),
  },
  {
    id: 's4',
    title: 'API 응답 캐싱 전략 논의',
    categoryId: 'qa',
    status: 'ready',
    createdAt: hoursAgo(3),
    updatedAt: minutesAgo(10),
  },
  {
    id: 's5',
    title: 'DB 마이그레이션 스크립트 리뷰',
    categoryId: 'refactor',
    status: 'ready',
    createdAt: hoursAgo(5),
    updatedAt: minutesAgo(15),
  },
  // idle
  {
    id: 's6',
    title: '에러 핸들링 통합 테스트',
    categoryId: 'bugfix',
    status: 'idle',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(1),
  },
  {
    id: 's7',
    title: 'CI 파이프라인 최적화',
    categoryId: 'refactor',
    status: 'idle',
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(2),
  },
  {
    id: 's8',
    title: '타입 시스템 정비',
    categoryId: 'refactor',
    status: 'idle',
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(3),
  },
  // off
  {
    id: 's9',
    title: '사용자 알림 시스템 설계',
    categoryId: 'feature',
    status: 'off',
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(5),
  },
  {
    id: 's10',
    title: '세션 복구 로직 디버깅',
    categoryId: 'bugfix',
    status: 'off',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: 's11',
    title: '모바일 반응형 레이아웃',
    categoryId: 'feature',
    status: 'off',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: 's12',
    title: '퍼포먼스 프로파일링',
    categoryId: 'refactor',
    status: 'off',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  // done
  {
    id: 's13',
    title: 'shadcn/ui 초기 셋업',
    categoryId: 'feature',
    status: 'done',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    id: 's14',
    title: '메모리 누수 수정',
    categoryId: 'bugfix',
    status: 'done',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
  },
  {
    id: 's15',
    title: 'README 문서 정비',
    categoryId: 'daily',
    status: 'done',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
  },
  {
    id: 's16',
    title: '테스트 커버리지 확대',
    categoryId: 'qa',
    status: 'done',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },
  {
    id: 's17',
    title: 'ESLint 규칙 커스터마이징',
    categoryId: 'refactor',
    status: 'done',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },
  {
    id: 's18',
    title: '데일리 스탠드업 정리',
    categoryId: 'daily',
    status: 'done',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  },
  {
    id: 's19',
    title: 'TanStack Query 도입',
    categoryId: 'feature',
    status: 'done',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  },
  {
    id: 's20',
    title: '인증 토큰 갱신 버그 수정',
    categoryId: 'bugfix',
    status: 'done',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  },
]
