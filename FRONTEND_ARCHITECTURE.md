# Frontend Architecture Guide

## 설계 방향

이 프로젝트의 프론트엔드 설계는 **변경 응집도(co-location)**를 우선한다.
"기능이 바뀔 때 고쳐야 할 곳이 몇 군데인가"가 설계 판단의 중요한 질문이다.

레이어 분리, 추상화, 컴포넌트 순수성도 유효한 가치이지만,
이 프로젝트의 규모와 맥락에서는 변경 응집도를 더 우선한다.

## 왜 레이어 분리보다 co-location을 선호하는가

클린 아키텍처나 헥사고날 아키텍처는 "인프라가 바뀌어도 비즈니스 로직은 안 건드린다"를 목표로
기술적 역할별로 코드를 분리한다 (API 레이어, 도메인 레이어, 프레젠테이션 레이어 등).

프론트엔드에서는 이 접근이 비용 대비 효과가 낮은 경우가 많다:

- HTTP 라이브러리를 교체하는 일은 현실적으로 거의 없다
- TanStack Query 같은 도구가 캐시, 재시도, 상태 관리를 통째로 해주기 때문에 그 위에 추상화를 얹으면 오히려 기능을 제한할 수 있다
- 레이어마다 파일을 나누면, 하나의 기능을 변경할 때 여러 레이어의 파일을 돌아다녀야 한다

반면 co-location은 함께 변경되는 코드를 같은 위치에 둔다.
기능을 추가하거나 제거할 때 한 곳에서 작업이 끝나는 경우가 많다.

## 데이터 페칭: 사용하는 곳이 요청한다

데이터를 렌더링하는 컴포넌트가 해당 데이터의 요청을 소유하는 것을 선호한다.

예를 들어, SessionCard가 카테고리 뱃지를 표시한다면,
카테고리 데이터를 요청하는 것은 SessionCard의 책임이다.
SessionList가 카테고리를 대신 가져와서 내려주는 것이 아니다.

이렇게 하면:

- 카테고리 뱃지를 제거할 때 SessionCard에서 훅 호출 한 줄만 지우면 된다
- 다른 파일을 돌아다닐 필요가 없다
- 표시할 데이터가 사라지면 요청도 자연스럽게 함께 사라진다

TanStack Query의 캐시가 중복 요청을 자동으로 제거하기 때문에,
여러 컴포넌트가 같은 훅을 호출해도 실제 네트워크 요청은 1번이다.

### 간접 전달도 "내려주기"에 해당한다

`category` 객체를 props로 직접 내려주는 것은 쉽게 눈치챌 수 있지만,
룩업 맵이나 파생 배열 형태로 우회해 내려주는 경우가 놓치기 쉽다.

```tsx
// 이것도 "카테고리를 대신 가져와 내려주는" 행위다
const categoryMap = new Map(categories.map((c) => [c.id, c]))
return sessions.map((s) => <SessionCard category={categoryMap.get(s.categoryId)} ... />)
```

`Map`, `Object.fromEntries`, `.find`, `.filter`로 다른 도메인 데이터를
현재 컴포넌트가 연결하고 있다면, 그 연결을 leaf로 내려야 한다는 신호다.
leaf가 `useCategory(id)` 같은 훅으로 직접 조회하면 된다.

예외는 명확히 성능상 문제가 증명된 경우뿐이고, 실제로는 거의 발생하지 않는다.

## 컴포넌트 순수성에 대한 입장

"컴포넌트는 props만 받아야 한다"를 기본 규칙으로 두지 않는다.
컴포넌트가 자기 데이터를 직접 요청하는 것은 자연스러운 패턴이다.

순수 표현 컴포넌트로 만드는 것이 유리한 경우도 있다:

- 실제로 여러 맥락에서 재사용되는 컴포넌트
- Storybook 등에서 독립적으로 렌더링해야 하는 컴포넌트

상황에 따라 판단하되, 기본적으로는 co-location 쪽을 선호한다.

## 추상화와 레이어를 나누는 시점

다음 중 하나에 해당하면 분리를 검토한다:

- 같은 조합 로직이 2곳 이상에서 실제로 반복될 때
- 데이터 변환이 복잡해서 컴포넌트 가독성을 해칠 때
- 테스트에서 격리가 실제로 필요할 때

해당하지 않으면 나누지 않는다.
"나중에 필요할 수도 있으니까"는 분리 이유가 아니다.

## 수평 일관성은 컨벤션으로 확보한다

feature-based 폴더 구조는 기능별로 코드를 수직으로 묶는다.
feature 간의 수평 일관성은 코드 레이어가 아니라 컨벤션과 공유 프리미티브로 확보한다:

- 각 feature가 따르는 공통 패턴 (query 훅 래핑, ErrorBoundary 배치 등)
- 공유 UI 프리미티브 (`components/ui/`)
- 공유 타입과 스키마 (`@cdash/shared`)

컨벤션은 CLAUDE.md에 실행 가능한 규칙으로 정의한다.

## 의사결정: 무한스크롤 (Issue #21)

### 1. API 설계 — offset 재사용 vs cursor 분리

**선택**: 무한스크롤 전용 `fetchSessionsInfinite(cursor, limit)`를 **cursor 기반으로 신설**. 페이지네이션 탭은 기존 `fetchSessionsPaginated`(offset) 유지.

**근거**:

- offset 페이지네이션은 리스트 mutation(삽입/삭제)과 함께 **중복/누락**이 발생하는 본질적 불안정성을 가진다. 무한스크롤처럼 결과가 누적되는 UX에선 이 불안정이 특히 눈에 띈다.
- cursor 기반(last id + 정렬)으로 가면 구조적으로 해결되고, 훅과 컴포넌트가 안정성 걱정 없이 단순하게 유지된다.
- 페이지네이션 탭은 totalPages/page 번호가 UI에 필요하므로 offset을 유지하는 것이 자연스럽다. 두 탭은 UI 모델이 다르므로 API도 다른 게 정합적이다.

**만약 offset API만 쓸 수 있는 상황이라면** (외부 제약):

- 1순위: id 기반 dedup — 중복 제거만. skip은 못 잡음.
- 2순위: pull-to-refresh / 첫 페이지 주기 invalidate — 완벽 해결 포기, 사용자가 리셋할 수 있는 UX 제공.
- 3순위: 변경 이벤트(WS/SSE)가 있다면 `setQueryData`로 캐시 직접 동기화.
- 오버페치+경계 dedup도 이론적으로는 유효(버퍼 이내 mutation에 한해 중복·skip 모두 해결)하지만, 경계 재조정 로직의 복잡도/silent failure 리스크 대비 cursor 전환이 대체로 더 견고. "효과가 낮아서"가 아니라 "같은 엔지니어링 예산이면 cursor가 낫기 때문에" 실무 채택률이 낮다.

### 2. 인터섹션 옵저버 — 컴포넌트 vs 훅

**선택**: 선언적 컴포넌트 `<IntersectionTrigger onEnter disabled />`.

**근거**:

- JSX 트리에 "다음 로드 트리거 지점"이 시각적으로 드러나 리스트 구조 읽기가 쉽다.
- ref 배선/effect 정리가 호출부 바깥으로 빠진다.
- 훅 방식도 유효하지만 이번엔 sentinel을 렌더 위치로 "두는" 감각이 더 명시적이어서 컴포넌트로 갔다.

### 3. 로딩 경계 — 초기엔 Suspense, 추가엔 인라인

**선택**: 페이지 단위 `SuspenseBoundary`는 **초기 로드용**. 추가 페이지는 리스트 하단의 `role="status" aria-live="polite"` 영역에서 스피너/완료/에러 메시지로 표시.

**근거**:

- Suspense는 "보여줄 게 없을 때 경계를 fallback으로 대체"하는 도구. 이미 카드가 보이는 상태의 추가 로딩에 걸면 기존 카드가 fallback으로 대체되어 **상단이 깜빡임**.
- `empty → content`와 `content → more`는 다른 상태이며 서로 다른 도구가 맞다. 축을 "메커니즘"이 아니라 "사용자가 보는 상태"에 두면 오히려 일관된 원칙이다.
- `useSuspenseInfiniteQuery`는 첫 페이지만 서스펜드하고 `fetchNextPage`는 서스펜드하지 않는다. 개발자 측 분기 없이 훅이 자동으로 이 구분을 제공한다.

### 4. 카드 내부 SuspenseBoundary — 경계 격리

**선택**: `SessionCard`에 자기 전용 `SuspenseBoundary`를 래핑. 카테고리 조회가 재suspend되어도 해당 카드만 fallback이 뜬다.

**근거**:

- leaf-ownership 원칙: `SessionCard`가 카테고리 데이터의 소유자이므로 그 로딩 경계도 카드 안이 자연스럽다.
- 카테고리 캐시가 외부에서 reset/remove되는 미래 기능(카테고리 관리 등)을 가정했을 때, 경계가 없으면 외부 페이지 `SuspenseBoundary`가 터지면서 무한스크롤 리스트 전체가 사라진다 → 스크롤 위치 손실.
- fallback은 카드 크기의 스켈레톤으로 레이아웃 점프를 방지한다.
- `invalidateQueries`는 데이터를 유지하므로 재suspend되지 않지만, `resetQueries`/`removeQueries`는 재suspend를 유발한다. 방어 비용이 거의 없으므로 미리 친다.

### 5. 쿼리키 분리

**선택**: `sessionKeys.infinite({ pageSize })`. 페이지네이션의 `sessionKeys.list({ page, pageSize })`와 완전 분리.

**근거**:

- 두 탭은 응답 형태(offset vs cursor)와 캐시 엔트리 단위가 다르다. 같은 키를 공유하면 혼선/오염 위험.
- 공통 prefix `sessionKeys.all`은 유지하여 "세션 전체 무효화" 시 둘 다 한 번에 정리 가능.

### 6. 접근성

- 추가 로딩 영역에 `role="status" aria-live="polite"` — 로딩/완료/에러 상태 전환이 스크린 리더에 전달된다.
- 에러는 throw하지 않고 인라인 버튼으로 재시도 제공 (리스트 보존).
- IntersectionTrigger sentinel은 `aria-hidden="true"` — 보조 기술에 노이즈를 주지 않는다.

### 7. 후속으로 미룬 것

- **스크롤 위치 복원** (페이지 이동 후 돌아왔을 때)
- **카테고리 접근 패턴 재검토** — leaf-ownership + suspense 조합 유지 vs API denormalize로 전환
- **라이브러리 기반 대안** (`react-intersection-observer`, `@tanstack/react-virtual` 등)과의 비교 — 별도 PR에서 탐색
