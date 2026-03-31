# CLAUDE.md

## 프로젝트 개요

claude-dash (`cdash`) — Claude Code 세션 런처, 상태 체커, 업무 분석 대시보드.

### 문서 구조
- **README.md** — 프로젝트 동기, 핵심 기능, UI 콘셉트, 기술 스택 요약
- **DIRECTION.md** — 설계 상세 (UI, 데이터 모델, Hook/Channel 연동, 설정 파일)
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
- 데이터 페칭은 컴포넌트에서 직접 하지 않고 커스텀 훅으로 분리
- 순수 표현 컴포넌트와 로직 컴포넌트 분리 의식

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

- 훅 안에서 다른 훅 2개 이상 조합하면 커스텀 훅으로 추출
- TanStack Query는 반드시 커스텀 훅으로 래핑 (`useSessions`, `useSession` 등)
- Query key는 factory 패턴으로 중앙 관리 (`features/{기능}/api/queryKeys.ts`)

### API 레이어

- `features/{기능}/api/`에 API 함수 분리
- 컴포넌트/훅에서 fetch를 직접 호출하지 않음
- 흐름: API 함수 → 커스텀 훅(useQuery 래핑) → 컴포넌트

### Suspense/ErrorBoundary 배치

- 페이지 단위로 ErrorBoundary 배치
- 독립적으로 로딩 가능한 영역마다 Suspense 배치
- ErrorBoundary는 retry 가능하게 구현

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

## 주요 참고 자료

- 로드맵: https://github.com/HealGaren/claude-dash/issues/15
- Claude Code Channels API: https://code.claude.com/docs/en/channels-reference
- Claude Code Hooks: https://code.claude.com/docs/en/hooks
