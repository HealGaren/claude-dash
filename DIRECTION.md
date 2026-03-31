# claude-dash (`cdash`)

Claude Code session launcher, status checker, and work analytics dashboard.

## What is this?

Claude Code를 터미널에서 사용할 때 세션이 쌓이고, 맥락이 흩어지고, 유의미한 기록이 사라지는 문제를 해결하는 헬퍼 도구.

**claude-dash는 Claude Code의 관제 패널이다.** 터미널에서 작업하는 Claude Code 세션들을 빠르게 호출하고, 상태를 한눈에 확인하고, 완료된 작업을 분석/회고하는 데 집중한다.

## Core Concepts

### 세 가지 축

1. **빠른 호출 (Launch)**: 카테고리/프리셋 기반으로 세션을 즉시 시작하거나, 기존 세션을 원클릭으로 재개
2. **상태 체크 (Status)**: 활성 세션들의 처리 상태(Claude 응답중/입력 대기/유휴/종료)를 실시간 모니터링
3. **후분석 (Review)**: 일간/주간/월간 업무 요약, 반복 패턴 감지, 기술적 인사이트 추출

### 카테고리 (Work Context)

세션을 업무 맥락별로 그룹핑한다:
- Feature, Bugfix, Refactoring, Q&A, Daily Management 등
- 카테고리별 프롬프트 프리셋 지정 가능
- 카테고리별 터미널 창 배치 영역 지정 가능

### 세션 라이프사이클

```
생성 → 활성(active) → 대기(waiting) → 완료(done) → 아카이브(archived)
```

- 세션은 기본적으로 git worktree로 생성 (격리된 작업 환경)
- 완료 시 아카이브하여 메인 화면에서 제거
- 장기 세션 (daily management 등)도 지원

## Architecture

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
    │       │        │
    ▼       ▼        ▼
Terminal  .claude/  Claude API
(tmux)   (import)  (summaries)
```

## UI Modes

### Strip (~60px) - 항상 화면 한쪽에 떠있는 최소 형태
- 카테고리 아이콘 + 세션 상태 점만 표시
- 상태 전환 시 점 색상/애니메이션으로 알림

### Panel (~320px) - Strip에서 토글 확장
- 카테고리별 세션 카드 리스트
- 클릭 = 터미널 포커스 또는 resume
- 새 세션 생성, 아카이브 등 조작

### Dashboard (full tab) - 가끔 여는 분석 화면
- Grid View: 멀티 카테고리 동시 조망
- Timeline View: 일간 작업 타임라인
- Analytics View: 요약, 패턴 감지, 인사이트

## Tech Stack

| Layer | Tech | Rationale |
|-------|------|-----------|
| Frontend | React, TanStack Query, react-hook-form, Vite | 프론트엔드 학습 + 실전 프로젝트 |
| Backend/Daemon | Bun (TypeScript) | 경량, SQLite 내장, Claude Code와 같은 생태계 |
| Data | SQLite | 로컬 단일 파일, FTS5 검색, 백업 간편 |
| Terminal | tmux (기본), OS별 어댑터 | 세션 멀티플렉싱 |
| Native | Rust binary (필요 시) | 윈도우 포커스, 시스템 알림, 포커스 시간 측정 |
| Orchestration | MCP Channel Server | 마스터 세션에서 워커 세션 오케스트레이션 |

### Why not Electron?

이 도구의 메인 UI는 320px 사이드 패널이다. 이를 위해 Chromium 엔진(~150MB)을 번들하는 것은 과잉. 이미 열려있는 브라우저에 PWA 탭 하나를 추가하는 것이 합리적. Always-on-top이 필요해지면 Tauri 래퍼(~5-10MB)로 해결.

## Config & Portability

```
~/.cdash/                    # 글로벌 설정 (dotfiles로 동기화)
├── config.json
├── categories.json
├── presets/
├── layouts/
└── sync-manifest.json

<project>/.cdash/            # 프로젝트별 설정 (repo에 커밋 가능)
├── project.json
├── sessions.json
└── presets/
```

JSON 파일이 source of truth. SQLite는 로컬 캐시/분석용.
Git에 올려서 다른 PC에서 동일 환경 복원 가능.

## MCP Channel Integration

`cdash-orchestrator`라는 MCP Channel Server를 통해 Claude Code 마스터 세션이 다른 세션들을 오케스트레이션할 수 있다:

```bash
claude --channels server:cdash-orchestrator
```

마스터 세션의 Claude가 사용할 수 있는 도구:
- `cdash_start_session(title, category, project)`
- `cdash_stop_session(id)`
- `cdash_list_sessions(filter?)`
- `cdash_send_to_session(id, message)`
- `cdash_get_summary(period)`

## External Session Import

`.claude/projects/` 폴더를 스캔하여 cdash 바깥에서 생성된 Claude Code 세션도 불러올 수 있다. 강제로 cdash를 통해서만 사용하게 하지 않고, 자유롭게 섞어 쓸 수 있는 구조.
