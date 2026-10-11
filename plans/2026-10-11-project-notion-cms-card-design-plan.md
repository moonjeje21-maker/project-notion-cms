# 카드 디자인 다듬기 계획 (참고 이미지 반영)

## Context

사용자가 참고 디자인(`~/Desktop/Screenshot 2026-10-11 at 1.40.48 PM.png`, 위시리스트 앱 휴대폰 화면)을 보여 주며 단계별 디자인 수정 계획을 요청했다. 참고의 특징은 ① 어두운 배경 위에 테두리·배경 없는 둥근 이미지 카드, 이름은 이미지 아래 글자로 ② 높이가 제각각인 벽돌 쌓기 배치 ③ 맨 위에 색깔 있는 큰 종류 타일(이름 + 개수, 가로 스크롤) ④ 카드 위 "…" 메뉴, 가격, 하단 떠 있는 버튼.

사용자 결정(2026-10-11):

- 카드 배치: **정사각형 유지, 겉모습만** 바꾼다 (PRD 가정 "카드 이미지 크기" 유지, 최근 추가 순서 유지)
- 종류 배지: **작은 배지로 남긴다** (PRD F001 그대로)
- 종류 칩: **shadcn 기본 버튼 칩** (ROADMAP Task 005 그대로)
- 기본 테마: **기기 설정 따르기 유지**

따라서 PRD·기능 명세는 바뀌지 않고, 지금 바꾸는 것은 `item-card.tsx`의 겉모습뿐이다. 이 변경은 아직 커밋 전인 Task 003 작업에 합쳐 같은 PR로 올린다 (Task 004가 이 카드 위에 링크·대체 그림을 얹으므로 그 전에 모양을 확정하는 편이 좋다).

참고에서 **가져오지 않는 것**과 이유: 가격(PRD 제외 항목), "…" 메뉴·하단 버튼(읽기 전용 사이트라 할 동작이 없음), 벽돌 쌓기·색 타일·어둡게 고정(위 결정).

## 1단계 (지금): 카드 겉모습 — `src/components/features/wishlist/item-card.tsx`

현재: shadcn `Card`(흰 배경 + 얇은 테두리 `ring-1` + `rounded-xl`) 안에 이미지 → `CardContent`에 이름·배지. 참고처럼 바꾼 뒤 모습:

- 바깥 틀을 `Card`에서 **일반 `div`(`flex flex-col gap-2`)** 로 바꾼다. 테두리·배경이 사라지고 페이지 배경 위에 이미지가 바로 놓인다. `Card`·`CardContent` import 제거 (`src/components/ui/card.tsx`는 설치된 채로 둔다. 다른 곳에서 쓸 수 있고, 지우는 건 별도 결정)
- 이미지 영역 `div`: `aspect-square w-full overflow-hidden rounded-2xl bg-muted` — 참고처럼 **모서리를 더 둥글게**(`rounded-2xl`), 이미지가 비었거나 로드 전일 때 회색(`bg-muted`)이 보이도록 유지. `<img>`는 지금 그대로(`size-full object-cover`, `alt`, `loading="lazy"`, eslint 주석)
- 본문: `div.flex.flex-col.gap-1.px-0.5`에 이름 `<p className="line-clamp-2 text-sm font-semibold">`(참고처럼 조금 더 굵게) + `Badge variant="secondary"` 종류. 색은 토큰 클래스만 (`bg-muted`, 배지의 `bg-secondary`), 직접 색 없음
- 그리드 `item-grid.tsx`: 세로 간격만 살짝 키운다 — `gap-4` → `gap-x-4 gap-y-6` (카드에 테두리가 없어져 줄 사이 구분이 필요). 열 수(2/4)는 그대로
- `"use client"` 없음, 링크·대체 그림·hover 효과는 Task 004 (링크가 생길 때 `hover:opacity-90` 같은 효과를 함께 넣는다)
- 주석(한국어) 갱신: "참고 디자인대로 테두리 없는 둥근 이미지 + 아래 글자. Card 부품은 쓰지 않는다"

## 2단계 (Task 004, 작업 파일 만들 때 반영): 예외 상태를 새 모양에 맞추기

- 대체 그림은 이미지 영역 `div`(`rounded-2xl bg-muted`) 안에 `ImageOff` 아이콘만 가운데 놓는다. `imageUrl`이 비면 `<img>`를 아예 그리지 않는다 (ROADMAP Task 004에 이미 적어 둔 React 오류 해결)
- 링크가 있으면 카드 전체(`div`)를 `<a>`로 바꾸고 `group` + 이미지에 `transition group-hover:opacity-90`으로 "눌리는 것" 느낌을 준다. 링크 없으면 그대로 `div`, 배지 흐림(ROADMAP 그대로)

## 3단계 (Task 005, 작업 파일 만들 때 반영): 칩 줄을 참고처럼 가로 한 줄로

- 칩은 shadcn `Button`(`outline`/`default`, `size="sm"`) 그대로. 배치만 ROADMAP의 `flex flex-wrap gap-2` 대신 **휴대폰에서 가로 스크롤 한 줄**(`flex gap-2 overflow-x-auto`, 칩 `shrink-0`)로 바꿀지 Task 005 계획 때 결정한다. 참고 디자인과 같은 배치이고, 종류가 많아져도 세로 공간을 안 차지한다
- 색 타일·개수 표시는 하지 않는다 (사용자 결정)

## 바뀌는 파일 (1단계)

- `src/components/features/wishlist/item-card.tsx` — 위 모양으로 교체
- `src/components/features/wishlist/item-grid.tsx` — `gap-x-4 gap-y-6`
- `docs/roadmap/tasks/003-item-card-and-grid.md` — 변경 요약에 "디자인 다듬기(참고 이미지 반영): Card 부품 대신 테두리 없는 둥근 이미지 + 아래 글자" 한 줄 추가
- `docs/roadmap/ROADMAP.md` — Task 003 본문의 `Card` 설명과 "활용하는 기존 코드"의 `card`(소품 카드) 줄을 현재 모양으로 고침 (development-planner에게 요청). Task 004·005 항목에 2·3단계 메모 한 줄씩
- 이 계획 파일 → `plans/2026-10-11-project-notion-cms-card-design-plan.md`
- PRD는 바꾸지 않는다 (정사각형·배지·칩·반응형 명세 그대로)

## 검증

1. `npm run lint`, `npm run build` (`/` Revalidate 5m 유지)
2. 브라우저 `/` (dev 서버는 사용자가 `npm run dev`로 이미 켜 둠 — `lsof`로 확인 후 그대로 씀, 끝나도 끄지 않음):
   - 1280px: 4열, 카드에 테두리·흰 배경 없음, 이미지 모서리 둥글게, 아래에 이름(굵게)과 작은 배지
   - 375px(iframe): 2열, 같은 모양
   - 라이트·다크 모드 둘 다 이미지 영역이 회색(`bg-muted`)으로 비치고 글자가 읽힘 (머리글 토글로 전환)
   - 스크린샷 `.playwright-mcp/task-003-design-desktop.png`·`task-003-design-mobile.png`
3. `git status`에 위 파일만. 새 파일 없음, `"use client"` 없음
4. 끝나면 Task 003과 함께 `/ship` (사용자가 호출)

## 완료 상태 (2026-10-11)

- ✅ 1단계: `item-card.tsx`를 `Card` 없이 둥근 이미지 + 아래 글자로 교체, `item-grid.tsx` `gap-y-6`. lint·build 통과, `/` Revalidate 5m 유지
- ✅ 브라우저: 1512px 4열, 375px(iframe) 2열, `data-slot="card"` 없음, 이미지 모서리 18px. 라이트·다크 모두 이미지 영역 회색·글자 읽힘. 스크린샷 `.playwright-mcp/task-003-design-desktop.png`(다크)·`-desktop-light.png`·`-mobile.png`. 확인 중 다크로 바꾼 테마는 "시스템 설정"으로 되돌림. 콘솔 오류 2건은 기존 것(빈 `src`는 Task 004, body class는 Chrome 확장)
- ✅ 작업 파일 003 변경 요약에 디자인 다듬기 줄 추가. ROADMAP은 development-planner
- 2·3단계는 Task 004·005 작업 파일을 만들 때 반영 (ROADMAP에 메모)

## 남은 작업

- Task 003과 함께 `/ship` (사용자 호출). 이후 "Task 004 작업 파일 만들어줘"
