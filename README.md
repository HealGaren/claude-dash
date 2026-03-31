# claude-dash (`cdash`)

Claude Code 세션 런처, 상태 체커, 업무 분석 대시보드.

## 왜 만드는가

Claude Code를 터미널에서 쓰다 보면:
- 세션이 쌓이는데 어떤 게 돌고 있는지 한눈에 안 보인다
- "응답 왔나?" 확인하려고 터미널을 일일이 전환해야 한다
- 하루 끝에 뭘 했는지 기록이 흩어져 있다

**cdash는 Claude Code의 관제 패널이다.** 터미널에서 작업하는 세션들을 빠르게 호출하고, 상태를 한눈에 확인하고, 완료된 작업을 분석/회고하는 데 집중한다.

## 핵심 기능

### 1. 빠른 호출 (Launch)
카테고리/프리셋 기반으로 세션을 즉시 시작하거나, 기존 세션을 원클릭으로 재개.

### 2. 상태 체크 (Status)
활성 세션들의 처리 상태를 실시간 모니터링. `running → ready` 전환이 핵심 알림 트리거.

### 3. 후분석 (Review)
일간/주간/월간 업무 요약, 반복 패턴 감지, 기술적 인사이트 추출.

## UI 콘셉트

작업 공간은 터미널이고, cdash는 도우미. 풀사이즈 앱이 아니라 **관제 패널**.

| 모드 | 크기 | 역할 |
|------|------|------|
| **Strip** | ~60px | 화면 한쪽에 붙어있는 최소 형태. 세션 상태 점만 표시 |
| **Panel** | ~320px | Strip에서 토글 확장. 세션 카드 리스트, 생성/아카이브 조작 |
| **Dashboard** | 풀 탭 | 멀티 카테고리 그리드, 타임라인, 분석 화면 |

UI 설계 상세 (세션 카드, 인터랙션, 세션 상태 정의 등)는 [DIRECTION.md](./DIRECTION.md) 참고.

## 아키텍처

```
┌─────────────────────────┐
│   Web UI (React, PWA)   │  ← 메인 인터페이스
│   Strip / Panel / Dash  │
└───────────┬─────────────┘
            │ WebSocket + REST
┌───────────▼─────────────┐
│   cdash daemon (Bun)    │  ← 백그라운드 서비스
│   - Session manager     │
│   - Hook engine         │
│   - Analytics engine    │
│   - SQLite storage      │
└───────────┬─────────────┘
            │
    ┌───────┼────────┐
    ▼       ▼        ▼
Terminal  .claude/  Claude API
(wt/tmux) (import)  (summaries)
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React, Vite, shadcn/ui + Tailwind, TanStack Query |
| 백엔드/데몬 | Bun (TypeScript) |
| 데이터 | SQLite |
| 터미널 통합 | Windows Terminal (기본), tmux (보조) |
| 오케스트레이션 | MCP Channel Server |
| 패키지 매니저 | pnpm (모노레포 workspace) |

## 현재 상태

Phase 0 (기반 구축) 진행 중. [로드맵 이슈](https://github.com/HealGaren/claude-dash/issues/15) 참고.

## 문서 안내

| 문서 | 내용 |
|------|------|
| [DIRECTION.md](./DIRECTION.md) | 설계 상세 — UI 설계, 데이터 모델, Hook/Channel 연동, 설정 파일 구조 |
| [CLAUDE.md](./CLAUDE.md) | AI/개발 컨벤션 — 코드 스타일, 프로젝트 구조, 기술 스택 규칙 |
