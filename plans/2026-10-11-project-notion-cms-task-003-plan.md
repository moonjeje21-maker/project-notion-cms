# Task 003 구현 계획: 기본 소품 카드와 카드 그리드

## Context

명세는 `docs/roadmap/tasks/003-item-card-and-grid.md`에 있고 여기엔 다시 적지 않는다. 이 계획은 실제 수정 순서와 확인 방법만 적는다. 목표는 `/`의 "소품 9개" 문구를 카드 그리드로 바꾸는 것 — 더미 소품 9개가 정사각형 이미지 · 이름 · 종류 배지 카드로, 휴대폰 2열 / 데스크톱 4열로 보이게 한다 (F001). 예외 상태(대체 그림·링크·"기타" 흐림)는 Task 004, 칩·빈 상태는 Task 005라서 이번엔 `"use client"` 없이 서버 컴포넌트로만 만든다.

이번 Task는 PR 18로 추가한 **`developer` 에이전트의 첫 실전 투입**이다. 코드 작성·lint·build·작업 파일 체크는 developer가 하고, 브라우저 확인·완료 표시·ROADMAP 갱신 요청은 메인 대화(나)가 한다 (`plans/2026-10-11-project-notion-cms-developer-agent-plan.md`의 "남은 작업").

미리 확인한 사실:

- shadcn `card`·`badge`가 이미 설치돼 있어 추가 설치 없음 (`src/components/ui/card.tsx`는 `Card`·`CardContent` 등 7조각, `badge.tsx`는 `variant` 6종)
- `Card`는 `<img>`가 첫 직계 자식일 때만 위 여백을 없애므로(`has-[>img:first-child]:pt-0`), 이미지를 `div`로 감싸는 우리 구조에서는 `Card`에 `pt-0`을 직접 준다 (작업 파일 명세와 같음)
- ESLint `@next/next/no-img-element`는 `warn` 수준이라 lint가 실패하진 않지만, 경고가 나면 작업 파일대로 그 줄에 한국어 이유를 적은 `eslint-disable-next-line` 주석을 붙인다. 설정 파일은 고치지 않는다

## 수정 순서

1. **구현 (developer 에이전트)**: 작업 파일 경로와 이 계획 파일 경로를 넘겨 구현 단계 1~4를 맡긴다
   - 새 파일 `src/components/features/wishlist/item-card.tsx` (`ItemCard`), `item-grid.tsx` (`ItemGrid`)
   - 고칠 파일 `src/components/features/wishlist/wishlist-view.tsx` (`<p>` → `<ItemGrid items={items} />`, 주석 현행화)
   - `page.tsx`·`items.ts`·`mock-items.ts`·`src/components/ui/`는 건드리지 않음
   - developer가 `npm run lint` → `npm run build`까지 돌리고, build 라우트 표에서 `/` Revalidate 5m 유지를 확인한 뒤 작업 파일의 구현 단계 1~4와 완료 기준 lint·build를 체크한다. 상태는 `진행 중`으로 둔다
   - developer가 막혔다고 보고하면(설치·설정·범위 밖 변경 필요) 그 내용을 사용자에게 전하고 멈춘다
2. **브라우저 확인 (메인 대화)**: `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 dev 서버 확인 후 없으면 `npm run dev`. Claude in Chrome으로 `/`를 열어 아래 검증 절 수행. 끝나면 dev 서버를 끈다
3. **작업 파일 마무리 (메인 대화)**: 브라우저 완료 기준 3개 체크, 구현 단계 5 체크, 상태 `완료`, 변경 요약에 스크린샷 경로와 확인 결과 보충
4. **계획 파일**: 이 파일을 `plans/2026-10-11-project-notion-cms-task-003-plan.md`로 옮기고 완료 상태 추가
5. **ROADMAP**: `development-planner`에게 "Task 003 완료로 바꿔줘" (Task 003 ✅, Task 004에 `- 우선순위`). 커밋은 사용자가 `/ship` (src 변경이라 code-reviewer 필수)

## 검증

1. lint·build 통과 (developer 보고로 확인. 실패 인용이 있으면 멈춤)
2. 브라우저 `/` (Claude in Chrome):
   - 창 폭 375px: 카드가 2열, 9개 모두 보임 → 스크린샷 `.playwright-mcp/task-003-mobile.png`
   - 창 폭 1280px: 카드가 4열 → 스크린샷 `.playwright-mcp/task-003-desktop.png`
   - 카드마다 정사각형 이미지 · 이름 · 종류 배지. mock-8 배지는 "기타". 순서는 mock-1("오크 원목 사이드 테이블")이 맨 앞
   - "소품 9개" 문구가 사라짐. mock-3(이미지 없음)·mock-5(깨진 주소)는 빈 영역/깨진 아이콘이어도 정상 (Task 004 몫). 콘솔의 깨진 이미지 404 1건도 정상
3. `git status --short`에 `src/components/features/wishlist/` 3개 파일과 문서(작업 파일·ROADMAP·계획)만 있고 `page.tsx`·`items.ts`·`mock-items.ts`·`src/components/ui/` 변경 없음. 새 파일에 `"use client"` 없음

## 범위 밖

- 대체 그림(`onError`·`ImageOff`), 링크 새 탭, 링크 없는 카드·"기타" 흐림 (Task 004)
- 종류 칩, 빈 상태 2종 (Task 005)
- 중간 폭(`md`) 3열 — PRD에 없어 넣지 않음

## 완료 상태 (2026-10-11)

- ✅ 1단계: `developer` 에이전트 첫 실전 투입 — `item-card.tsx`·`item-grid.tsx` 생성, `wishlist-view.tsx` 교체, lint(경고 0)·build 통과, `/` Revalidate 5m 유지, 작업 파일 체크·상태 `진행 중` 유지까지 보고 형식대로 수행. hook 차단·막힌 것 없음
- ✅ 2단계: 브라우저 확인 — 1280px 4열, 375px 2열(창 최소 폭 때문에 iframe으로 확인), 9개 카드에 이미지·이름·배지, "소품 9개" 없음. 스크린샷 `.playwright-mcp/task-003-desktop.png`·`task-003-mobile.png`. dev 서버 종료
- ✅ 3·4단계: 작업 파일 상태 `완료`, 브라우저 체크박스, 변경 요약 보충. 계획 파일 이름 변경
- 발견: mock-3의 빈 `src=""`로 콘솔 React 오류 1건. Task 004의 대체 그림 분기로 해결 예정 (작업 파일 변경 요약에 적음)
- 5단계 ROADMAP 갱신은 development-planner, 커밋은 `/ship`

## 남은 작업

- 없음. 다음은 "Task 004 작업 파일 만들어줘"
