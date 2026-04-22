# CLAUDE.md

## 프로젝트 개요

claude-dash (`cdash`) — Claude Code 세션 런처, 상태 체커, 업무 분석 대시보드.

### 문서 구조

- **README.md** — 프로젝트 동기, 핵심 기능, UI 콘셉트, 기술 스택 요약
- **DIRECTION.md** — 설계 상세 (UI, 데이터 모델, Hook/Channel 연동, 설정 파일)
- **FRONTEND_ARCHITECTURE.md** — 프론트엔드 설계 철학, 판단 기준, 배경 설명
- **CLAUDE.md** — AI/개발 컨벤션, 코드 스타일, 프로젝트 구조 규칙

새 세션이나 작업 시작 전에 README.md → DIRECTION.md 순서로 읽고 맥락을 잡을 것.

## 기술 스택

- **프론트엔드**: React + TypeScript, Vite, shadcn/ui + Tailwind, TanStack Query, react-hook-form + zod, react-error-boundary
- **백엔드/데몬**: Bun + TypeScript
- **데이터**: SQLite (Bun 내장 또는 better-sqlite3)
- **공유**: zod 스키마로 프론트/백 타입 공유
- **오케스트레이션**: MCP Channel Server (@modelcontextprotocol/sdk)

## 프로젝트 구조

모노레포 (구성 예정):

- `packages/web` — React 프론트엔드 (Vite)
- `packages/daemon` — Bun 백엔드 데몬
- `packages/cli` — CLI 도구
- `packages/shared` — 공유 타입, zod 스키마, 상수

## 코드 컨벤션

- 언어: TypeScript strict mode
- 프론트엔드 데이터 페칭: `useSuspenseQuery` 사용, Suspense/ErrorBoundary 경계 적극 활용
- 폼: react-hook-form + zod resolver
- 상태: 서버 상태는 TanStack Query, 클라이언트 UI 상태만 로컬 (useState/zustand)
- 컴포넌트: shadcn/ui 기본 제공분 활용, 없으면 직접 구현
- 이슈/커밋/문서: 한국어

### 코드 품질 원칙 (모든 코드에 적용)

코드 한 줄마다 다음 질문에 답할 수 있어야 한다:

- 이 코드는 지금 필요한 기능인가? (불필요한 코드, 미래 대비 코드 금지)
- 너무 복잡하지는 않은가? 읽기 어렵지는 않은가? (가독성 우선)
- 이 코드가 여기에 있는게 맞는가? (적절한 위치, 적절한 추상화 레벨)

## 프론트엔드 컨벤션

### 폴더 구조 (`packages/web/src/`)

```
src/
  main.tsx            # Vite 엔트리포인트 (이 파일만 src/ 루트)
  index.css           # 글로벌 스타일
  test-setup.ts       # 테스트 환경 설정
  app/              # 앱 진입점, 라우터, 프로바이더
  pages/            # 페이지 단위 컴포넌트 (라우트별)
  features/         # 기능 단위 모듈
    {기능명}/
      components/
      hooks/
      api/          # API 함수, queryKeys.ts
  components/       # 공용 UI 컴포넌트
    ui/             # shadcn/ui 컴포넌트
  hooks/            # 공용 훅
  lib/              # 유틸리티
  types/            # 프론트엔드 전용 타입
```

### 폴더 구조 규칙

- 특정 기능에만 쓰이면 `features/{기능명}/` 하위
- 2곳 이상에서 쓰이면 `components/` 또는 `hooks/`로 승격
- 페이지 컴포넌트는 `pages/`에만
- shadcn/ui 컴포넌트는 `components/ui/`
- 빈 폴더에 의미없는 barrel export 만들지 말 것 — `.gitkeep`으로 표시
- feature 모듈에서 공개 API를 정리하는 용도의 barrel export는 허용

### 컴포넌트 설계 원칙

- 한 파일에 한 컴포넌트 (named export만, `export default` 금지)
- 컴포넌트 150줄 넘으면 분리 신호
- Props는 컴포넌트 바로 위에 interface 정의, `{컴포넌트명}Props` 네이밍
- **데이터를 렌더링하는 컴포넌트가 해당 데이터를 직접 요청한다** (커스텀 훅을 통해)
- 표시할 데이터가 사라지면 요청도 함께 사라져야 한다

### 데이터 소유권: leaf 우선 (반드시 체크)

원칙: **데이터를 실제로 화면에 그리는 leaf 컴포넌트가 그 데이터를 직접 조회한다.** 상위 컴포넌트가 조회해서 내려주지 않는다.

아래 패턴은 모두 "상위가 대신 조회해서 내려주는" 안티패턴이다. 룩업 맵/파생 배열/ID→객체 변환 같은 간접적인 형태도 포함된다:

```tsx
// ❌ Don't — 상위에서 categoryMap을 만들어 내려준다
const SessionList = ({ sessions }) => {
  const { data: categories } = useCategories()
  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  return sessions.map((s) => (
    <SessionCard session={s} category={categoryMap.get(s.categoryId)} />
  ))
}

// ❌ Don't — props로 category 객체를 받는 SessionCard
const SessionCard = ({ session, category }) => { ... }
```

```tsx
// ✅ Do — leaf가 자기 카테고리를 직접 조회한다
const SessionCard = ({ session }) => {
  const category = useCategory(session.categoryId)
  ...
}

// 공통 조합 훅은 useCategories 재활용 + id 조회만 감싼다
export function useCategory(id: string) {
  const { data: categories } = useCategories()
  return categories.find((c) => c.id === id)
}
```

TanStack Query 캐시가 중복 요청을 제거하므로 성능 걱정 불필요. 여러 카드가 `useCategory`를 호출해도 실제 네트워크 요청은 1번.

**판정 팁**: 상위 컴포넌트에서 `new Map(...)`, `Object.fromEntries(...)`, `.find(...)`, `.filter(...)`로 다른 도메인 데이터를 "연결"하고 있다면 거의 확실히 안티패턴이다. 그 연결을 leaf로 내려라.

### 컴포넌트 내부 구조 순서

```tsx
// 1. import
// 2. Props interface
// 3. 컴포넌트 함수
//    - 훅 호출
//    - 파생 상태 (useMemo 등)
//    - 이벤트 핸들러
//    - early return (로딩, 에러 등)
//    - JSX return
```

### 커스텀 훅 패턴

- TanStack Query는 커스텀 훅으로 래핑 (`useSessions`, `useCategories` 등)
- Query key는 factory 패턴으로 중앙 관리 (`features/{기능}/api/queryKeys.ts`)
- 조합/변환 훅은 2곳 이상에서 반복될 때만 만든다

### API 레이어

- `features/{기능}/api/`에 API 함수 분리
- 흐름: API 함수 → 커스텀 훅(useQuery 래핑) → 컴포넌트
- 설계 판단이 애매할 때는 FRONTEND_ARCHITECTURE.md 참고

### Suspense/ErrorBoundary 배치

- 페이지 단위로 ErrorBoundary 배치
- 독립적으로 로딩 가능한 영역마다 Suspense 배치
- ErrorBoundary는 retry 가능하게 구현
- **Suspense + ErrorBoundary를 같이 쓰는 지점은 `components/SuspenseBoundary`로 통일** — 인라인으로 둘을 직접 조합하지 말 것
- 무한스크롤/pagination 등 **이미 컨텐츠가 보이는 상태에서의 추가 로딩에는 Suspense fallback을 쓰지 말 것** (전체 스켈레톤이 다시 뜨는 UX는 회피). 초기 로딩만 SuspenseBoundary fallback, 추가 로딩은 해당 영역 내부의 인디케이터로.

### import 규칙

- 절대경로(`@/`) 사용, 같은 feature 내부만 상대경로 허용
- 순서: 외부 패키지 → `@cdash/*` → `@/` → 상대경로
- type import는 `import type` 사용

### 파일 네이밍

- 컴포넌트: PascalCase (`SessionCard.tsx`)
- 훅: camelCase, use 접두사 (`useSessionList.ts`)
- 유틸/타입/API: camelCase (`formatDate.ts`, `sessionApi.ts`)

## 개발 환경

- OS: WSL2 + Windows Terminal
- 터미널 통합 우선순위: Windows Terminal (wt CLI) > tmux
- 패키지 매니저: pnpm (workspaces), 백엔드 데몬 런타임은 Bun

## 개발 명령어

> 아래 명령어는 #1 모노레포 스캐폴딩 완료 후 사용 가능합니다.

```bash
pnpm install              # 의존성 설치
pnpm dev:web              # 프론트엔드 개발 서버 (Vite, localhost:5173)
pnpm build                # 전체 패키지 빌드
pnpm typecheck            # 전체 TypeScript 타입 체크
pnpm lint                 # ESLint 실행
pnpm format               # Prettier 포맷팅
pnpm format:check         # Prettier 포맷 체크
```

## PR 올리기 전 셀프 체크리스트

프론트엔드 코드를 PR로 올리기 전에 아래 항목을 직접 확인한다. "당연히 지키고 있을 것"이라고 가정하지 말고 실제로 파일을 열어 확인한다.

- [ ] 각 컴포넌트가 표시하는 데이터를 **자기 자신이 직접 조회**하는가? 상위에서 `map`/`find`/룩업 맵으로 연결해 내려주는 곳은 없는가?
- [ ] `category`, `author`, `project` 같은 **관계 데이터**를 props로 넘기는 컴포넌트는 없는가? (있다면 해당 컴포넌트가 id로 직접 조회하도록 수정)
- [ ] `Suspense` + `ErrorBoundary`를 인라인으로 조합한 곳이 있는가? (있다면 `SuspenseBoundary` 공용 컴포넌트로 교체)
- [ ] 무한스크롤/페이지네이션에서 **추가 로딩 시 기존 컨텐츠가 깜빡이지 않는가**? (전체 Suspense fallback이 다시 뜨면 안 됨)
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` 모두 통과하는가?
- [ ] 함수/변수명이 6개월 뒤에도 읽기 쉬운가? (약어, 임시 네이밍 남아있지 않은가)
- [ ] 사용하지 않는 import, 주석 처리된 코드, TODO/FIXME 없이 깔끔한가?

## 주요 참고 자료

- 로드맵: https://github.com/HealGaren/claude-dash/issues/15
- Claude Code Channels API: https://code.claude.com/docs/en/channels-reference
- Claude Code Hooks: https://code.claude.com/docs/en/hooks
