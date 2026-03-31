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

## 개발 환경

- OS: WSL2 + Windows Terminal
- 터미널 통합 우선순위: Windows Terminal (wt CLI) > tmux
- 패키지 매니저: pnpm (workspaces), 백엔드 데몬 런타임은 Bun

## 개발 명령어

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
