# claude-dash (`cdash`)

Claude Code session launcher, status checker, and work analytics dashboard.

## What is this?

Claude Code를 터미널에서 사용할 때 세션이 쌓이고, 맥락이 흩어지고, 유의미한 기록이 사라지는 문제를 해결하는 헬퍼 도구.

**claude-dash는 Claude Code의 관제 패널이다.** 터미널에서 작업하는 Claude Code 세션들을 빠르게 호출하고, 상태를 한눈에 확인하고, 완료된 작업을 분석/회고하는 데 집중한다.

## 세 가지 축

1. **빠른 호출 (Launch)**: 카테고리/프리셋 기반으로 세션을 즉시 시작하거나, 기존 세션을 원클릭으로 재개
2. **상태 체크 (Status)**: 활성 세션들의 처리 상태를 실시간 모니터링
3. **후분석 (Review)**: 일간/주간/월간 업무 요약, 반복 패턴 감지, 기술적 인사이트 추출

## 핵심 개념

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

### 세션 상태

| 상태 | 표시 | 의미 |
|------|------|------|
| running | 🟢 펄스 애니메이션 | Claude 처리중 |
| ready | 🟡 깜빡임 | 응답 완료, 내 입력 대기 |
| idle | ⚪ | 켜져있으나 유휴 |
| off | ⭘ | 꺼짐, resume 가능 |
| done | ✅ | 완료, 아카이브 대기 |

`running → ready` 전환이 핵심 알림 트리거.

### 외부 세션 Import

`.claude/projects/` 폴더를 스캔하여 cdash 바깥에서 생성된 Claude Code 세션도 불러올 수 있다. 강제로 cdash를 통해서만 사용하게 하지 않고, 자유롭게 섞어 쓸 수 있는 구조.

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

## UI 설계

작업 공간은 터미널이고, cdash는 도우미. 풀사이즈 앱이 아니라 **관제 패널**.

### Strip (~60px) — 항상 화면 한쪽에 붙어있는 최소 형태
- 카테고리 아이콘 + 세션 상태 점(●/○)만 표시
- 상태 전환 시 점 색상/애니메이션으로 알림

### Panel (~320px) — Strip에서 토글 확장
- 카테고리별 세션 카드 리스트
- 클릭 = 터미널 포커스 또는 resume
- 새 세션 생성, 아카이브 등 조작
- 하단에 오늘 요약, 타임라인/분석 링크

### Dashboard (풀 탭) — 가끔 여는 분석 화면
- Grid View: 멀티 카테고리 동시 조망 (타일 드래그 리사이즈/리오더)
- Timeline View: 일간 작업 타임라인
- Analytics View: 요약, 패턴 감지, 인사이트

### 세션 카드 인터랙션

| 동작 | 결과 |
|------|------|
| 클릭 | 터미널 포커스 (켜져있으면) 또는 resume (꺼져있으면) |
| 드래그 | 카테고리 간 이동 |
| 우클릭 | 컨텍스트 메뉴: 아카이브, 요약, 라벨, 종료 |

## 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프론트엔드 | React, shadcn/ui + Tailwind, TanStack Query (useSuspenseQuery), react-hook-form + zod, react-error-boundary | Suspense/ErrorBoundary 적극 활용 |
| 백엔드/데몬 | Bun (TypeScript) | 경량, SQLite 내장 |
| 데이터 | SQLite | 로컬 단일 파일, FTS5 검색 |
| 터미널 | Windows Terminal (기본), tmux (보조) | WSL + wt CLI 환경 기준 |
| 네이티브 | Rust binary (필요 시) | 윈도우 포커스, 시스템 알림 |
| 오케스트레이션 | MCP Channel Server | 마스터-워커 세션 통신 |

### Electron을 쓰지 않는 이유

이 도구의 메인 UI는 320px 사이드 패널이다. Chromium 엔진(~150MB)을 번들하는 것은 과잉. 이미 열려있는 브라우저에 PWA 탭 하나를 추가하는 것이 합리적. Always-on-top이 필요해지면 Tauri 래퍼(~5-10MB)로 해결.

## 데이터 모델

```typescript
interface Category {
  id: string
  name: string           // "bugfix", "feature", "daily-standup"
  color: string
  icon: string
  promptPreset?: string  // 이 카테고리로 시작할 때 기본 프롬프트
  windowZone?: WindowZone
}

interface Session {
  id: string
  claudeSessionId?: string  // .claude의 실제 세션 ID
  title: string
  categoryId: string
  labels: string[]
  projectPath: string
  worktreePath?: string
  worktreeBranch?: string
  status: 'active' | 'waiting' | 'completed' | 'archived'
  terminalInfo?: {
    type: 'wt' | 'tmux' | 'iterm' | 'generic'
    identifier: string
    windowPosition?: { x: number; y: number; w: number; h: number }
  }
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  summary?: string
}

interface Activity {
  id: string
  sessionId: string
  type: 'prompt' | 'response' | 'tool_call' | 'error' | 'idle'
  content?: string
  durationMs?: number
  tokenCount?: number
  timestamp: Date
}

interface WorkSummary {
  id: string
  period: 'daily' | 'weekly' | 'monthly'
  date: string
  sessionIds: string[]
  summary: string
  technicalInsights: string[]
  repeatedPatterns: string[]
  generatedAt: Date
}
```

## 설정 파일 구조

```
~/.cdash/                    # 글로벌 설정 (dotfiles로 동기화 가능)
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

## Claude Code Hook 연동

```json
{
  "hooks": {
    "PostToolCall": [{ "command": "cdash hook activity --session $SESSION_ID" }],
    "Stop": [{ "command": "cdash hook done --session $SESSION_ID" }]
  }
}
```

## MCP Channel 오케스트레이션

`cdash-orchestrator` MCP Channel Server를 통해 Claude Code 마스터 세션이 다른 세션들을 오케스트레이션:

```bash
claude --channels server:cdash-orchestrator
```

마스터 세션의 Claude가 사용할 수 있는 도구:
- `cdash_start_session(title, category, project)`
- `cdash_stop_session(id)`
- `cdash_list_sessions(filter?)`
- `cdash_send_to_session(id, message)`
- `cdash_get_summary(period)`
