# claude-dash

> Claude Code를 위한 관제 패널.

[![CI](https://github.com/HealGaren/claude-dash/actions/workflows/ci.yml/badge.svg)](https://github.com/HealGaren/claude-dash/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220)](https://pnpm.io/)
[![Status](https://img.shields.io/badge/status-Phase%200-0E8A16)](#현재-상태)

> **Note**: 이 프로젝트는 개인 프로젝트이며, Anthropic과 관련이 없습니다.

---

## What is this?

여러 Claude Code 세션을 한눈에 보고, 빠르게 전환하고, 하루 작업을 돌아볼 수 있습니다.

Claude Code를 터미널에서 쓰다 보면 세션이 쌓이고, 어디서 응답이 왔는지 확인하려고 터미널을 하나씩 전환해야 합니다. 하루가 끝나면 뭘 했는지도 흩어져 있죠.

**claude-dash**는 이 문제를 해결합니다.

```
┌─────────────────────────┐
│   Web UI (React, PWA)   │
│   Strip / Panel / Dash  │
└───────────┬─────────────┘
            │ WebSocket + REST
┌───────────▼─────────────┐
│   cdash daemon (Bun)    │
│   Session · Hook · DB   │
└───────────┬─────────────┘
            │
    ┌───────┼────────┐
    ▼       ▼        ▼
Terminal  .claude/  Claude API
```

## Features

- **빠른 호출** — 카테고리/프리셋 기반으로 세션을 시작하거나, 기존 세션을 원클릭으로 재개
- **실시간 상태 모니터링** — 어떤 세션이 처리 중이고, 어떤 세션이 내 입력을 기다리는지 한눈에 확인
- **업무 회고** — 일간/주간 업무 요약, 반복 패턴 감지, 기술적 인사이트 자동 추출

## UI 콘셉트

작업 공간은 터미널이고, cdash는 옆에 붙어있는 작은 관제 패널입니다.

| 모드 | 크기 | 설명 |
|------|------|------|
| **Strip** | ~60px | 화면 한쪽에 상주. 세션 상태를 점(●/○)으로만 표시 |
| **Panel** | ~320px | Strip에서 확장. 세션 카드 리스트와 조작 UI |
| **Dashboard** | 풀 탭 | 멀티 카테고리 그리드, 타임라인, 분석 화면 |

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, shadcn/ui, Tailwind, TanStack Query |
| Backend | Bun + TypeScript |
| Data | SQLite |
| Terminal | Windows Terminal (default), tmux (fallback) |
| Package Manager | pnpm workspace |

## 현재 상태

Phase 0 (기반 구축) 진행 중입니다. 자세한 내용은 [로드맵](https://github.com/HealGaren/claude-dash/issues/15)에서 확인할 수 있습니다.

## Documentation

| Document | Description |
|----------|-------------|
| [DIRECTION.md](./DIRECTION.md) | 설계 상세 — UI, 데이터 모델, Hook/Channel 연동 |
| [CLAUDE.md](./CLAUDE.md) | 개발 컨벤션 — 코드 스타일, 프로젝트 구조 |
