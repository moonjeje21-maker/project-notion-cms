# Task 005 구현 계획: 종류 칩 필터와 빈 상태

## Context

명세는 `docs/roadmap/tasks/005-category-chips-and-empty-state.md`에 있고 여기엔 다시 적지 않는다. 이 계획은 실제 수정 순서와 확인 방법만 적는다. 목표는 카드 그리드 위에 "전체 · 가구 · 조명 · … · 기타" 알약 모양 칩을 가로 한 줄로 두고, 누르면 그 종류만 보이게 하는 것(F003), 그리고 빈 상태 2종(F004)이다. 사용자가 참고 디자인을 보고 "카테고리 버블"을 요청해 Task 004보다 먼저 한다 (2026-10-11 순서 변경, ROADMAP 반영 완료).

사용자 결정(2026-10-11): shadcn 기본 `Button` 칩, 알약 모양(`rounded-full`), 휴대폰에서 가로 스크롤 한 줄, 색 타일·개수 표시 없음.

핵심 제약: 필터는 브라우저 안에서만 동작하고 **주소를 바꾸지 않는다**. `useSearchParams`·`router.push`를 쓰면 `/`의 5분 자동 갱신(ISR)이 깨지므로 금지. build 라우트 표에서 `/`가 계속 `○ … Revalidate 5m`이면 지켜진 것이다.

미리 확인한 사실:

- `src/components/ui/empty.tsx`는 `Empty`·`EmptyHeader`·`EmptyMedia`(`variant="icon"`)·`EmptyTitle`·`EmptyDescription` export. 추가 설치 없음
- `src/components/ui/button.tsx` 기본 클래스에 `shrink-0`·`whitespace-nowrap`이 있고 `className`은 `cn()`으로 합쳐져 `rounded-full`이 `size="sm"`의 둥글기를 덮어쓴다
- `wishlist-view.tsx`에 `"use client"`를 붙이면 `ItemGrid`·`ItemCard`도 브라우저 번들에 들어가지만 서버 전용 코드가 없어 문제없다. `page.tsx`는 서버 컴포넌트 그대로이고 `items`(평범한 객체 배열)를 prop으로 넘기는 것은 Next.js 문서(`05-server-and-client-components.md` "Passing data from Server to Client Components")대로 허용된다

## 수정 순서

1. **구현 (developer 에이전트)**: 작업 파일과 이 계획 파일 경로를 넘겨 구현 단계 1~4를 맡긴다
   - 새 파일 `src/components/features/wishlist/category-chips.tsx` (`CategoryChips`, `ALL_CATEGORY = "전체"`, `"use client"`)
   - 고칠 파일 `wishlist-view.tsx` (`"use client"`, `useState`, 칩 목록 계산, 필터, 빈 상태 2종), `item-grid.tsx` 주석 한 줄
   - `item-card.tsx`·`page.tsx`·`items.ts`·`mock-items.ts`·`src/components/ui/`는 건드리지 않음
   - lint → build, `/` Revalidate 5m 유지 확인, 작업 파일 구현 단계 1~4와 lint·build 체크, 상태 `진행 중`
   - 작업 파일 단계 6·7(검증 전용 임시 변경)은 developer가 하지 않는다 (에이전트 규칙). 메인 대화가 한다
2. **브라우저 확인 (메인 대화)**: dev 서버(`lsof`로 확인, 사용자가 켜 둔 것 사용). Claude in Chrome으로 아래 검증 절 수행
3. **검증 전용 임시 변경 (메인 대화)**: 작업 파일 단계 6·7 — `page.tsx`에 잠시 `items={[]}`, `wishlist-view.tsx` 칩 목록에 잠시 `"거울"` 추가 → 확인 → 즉시 되돌림 → `git diff`로 원복 확인
4. **작업 파일 마무리**: 브라우저 체크박스, 단계 5~8 체크, 상태 `완료`, 변경 요약 보충
5. **계획 파일**: `plans/2026-10-11-project-notion-cms-task-005-plan.md`로 옮기고 완료 상태 추가
6. **ROADMAP**: `development-planner`에게 "Task 005 완료로 바꿔줘" (Task 005 ✅, Task 004에 `- 우선순위` 복귀). 커밋은 사용자가 `/ship` (src 변경이라 code-reviewer 필수)

## 검증

1. lint·build 통과, 라우트 표 `/` `○` + Revalidate 5m (developer 보고로 확인. `ƒ` 동적으로 바뀌면 멈춤)
2. 브라우저 `/` (1280px 창):
   - 칩 순서 `전체 · 가구 · 조명 · 화분 · 수납 · 러그 · 소품 · 기타`, "전체" 선택 상태(채워진 색), 카드 9장
   - "가구" 클릭 → 2장(오크 원목 사이드 테이블, 월넛 책장), 주소창 `http://localhost:3000/` 그대로(쿼리·해시 없음). "기타" 클릭 → 1장(빈티지 벽시계). "전체" 클릭 → 9장
   - 선택 칩 `aria-pressed="true"`, 나머지 `false` (JS로 확인)
   - 375px(iframe): 칩이 한 줄, 세로 줄바꿈 없음, 가로 스크롤로 "기타"까지 닿음 (`scrollWidth > clientWidth` 확인)
   - 스크린샷 `.playwright-mcp/task-005-desktop.png`·`task-005-mobile.png`
3. 검증 전용(임시 변경 후 즉시 원복):
   - 소품 0개: 칩 없음 + "아직 소품이 없어요" → `.playwright-mcp/task-005-empty-all.png`
   - 필터 0개: "거울" 칩 클릭 시 칩 유지 + "이 종류의 소품이 없어요", "전체"로 복귀 → `.playwright-mcp/task-005-empty-filter.png`
4. `git status --short`에 `category-chips.tsx`(새), `wishlist-view.tsx`, `item-grid.tsx`(주석), 문서(작업 파일·ROADMAP·계획)만. `page.tsx`·`item-card.tsx`·`mock-items.ts` 변경 없음. 두 파일에 `useSearchParams`·`useRouter` 없음(grep)

## 범위 밖

- 대체 그림·링크·"기타" 배지 흐림 (Task 004, 다음 순서)
- 필터 값을 주소에 담아 공유 (PRD 제외 항목)
- 칩 색 타일·개수 표시 (사용자 결정으로 제외)

## 완료 상태 (2026-10-11)

- ✅ 1단계: `developer` 에이전트가 `category-chips.tsx`(새)·`wishlist-view.tsx`·`item-grid.tsx`(주석) 구현. lint(경고 0)·build 통과, `/` `○` Revalidate 5m 유지, `useSearchParams`·`useRouter` 없음
- ✅ 2단계: 브라우저 정상 흐름 전부 통과 (칩 순서, 가구 2·조명 2·기타 1, 전체 복귀, 주소 불변, `aria-pressed`, 375px 한 줄 가로 스크롤)
- ✅ 3단계: 검증 전용 임시 변경 2건으로 빈 상태 2종 확인 후 즉시 원복. `page.tsx`·`items.ts`·`mock-items.ts`·`item-card.tsx` diff 없음
- ✅ 4·5단계: 작업 파일 상태 `완료`·체크박스·변경 요약 보충, 계획 파일 이름 변경
- ✅ 6단계: ROADMAP 갱신 완료(Task 005 ✅, Task 004 `- 우선순위` 유지). 커밋·PR은 `/ship`으로 진행

## 남은 작업

- 없음. 다음은 "Task 004 작업 파일 만들어줘" (예외 상태: 대체 그림·링크)
