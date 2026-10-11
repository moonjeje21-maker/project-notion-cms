# Task 003: 기본 소품 카드와 카드 그리드 만들기

담당 기능: F001 · Phase 2 · 상태: 완료

## 목표

더미 소품(`mockItems`)을 카드(이미지 · 이름 · 종류 배지)로 그리고, 휴대폰 2열 / 데스크톱 4열 그리드로 나열한다. `WishlistView`의 "소품 N개" 문구를 지우고 그 자리에 그리드를 넣어, `/`를 열면 소품 9개가 카드로 보이게 한다. 이 Task는 **정상 데이터(이미지·링크·종류가 모두 있는 소품)를 그리는 틀**만 만든다. 이미지 없음·깨짐의 대체 그림, 상품 링크 새 탭 열기·링크 없는 카드 처리, "기타" 배지의 흐림 처리는 **Task 004**가 같은 파일(`item-card.tsx`)에 덧붙인다. 그래서 이 Task에서는 `"use client"`를 붙이지 않는다 (상태·이벤트 핸들러가 없는 서버 컴포넌트).

PRD 근거: F001 "카드(이미지·이름·종류 배지)로 보여준다 … 반응형: 휴대폰 2열, 데스크톱 4열", 페이지별 상세 "카드 그리드: 이미지 · 이름 · 종류 배지, 휴대폰 2열 / 데스크톱 4열 반응형 (F001)", 가정 "카드 이미지 크기: 이미지는 정사각형 영역에 맞춰 잘라 보여 준다(`object-cover`)". 정렬(최근 추가가 위)은 데이터 쪽(더미 배열 순서, Task 006부터는 `fetchAllRows()`의 `created_time` 내림차순)이 이미 담당하므로 화면은 받은 순서 그대로 그린다.

## 관련 파일

- 새로 만들 파일:
  - `src/components/features/wishlist/item-card.tsx` (`ItemCard` — 소품 한 개 카드)
  - `src/components/features/wishlist/item-grid.tsx` (`ItemGrid` — 카드를 2열/4열로 나열)
- 고칠 파일:
  - `src/components/features/wishlist/wishlist-view.tsx` ("소품 N개" 문구를 지우고 `ItemGrid`를 그림. 낡은 주석 "Task 002부터 카드 그리드가 들어간다"도 함께 고침)
- 건드리지 않는 파일:
  - `src/app/(marketing)/page.tsx` — 이미 `<WishlistView items={mockItems} />`로 연결돼 있고 `revalidate = 300`이 있음. 서버 컴포넌트 그대로 둠
  - `src/lib/items.ts`·`src/lib/mock-items.ts` — 타입과 더미는 Task 001 그대로 씀
- 참고할 기존 코드:
  - `src/lib/items.ts` — `Item` 타입(`id`·`name`·`url`·`imageUrl`·`category`, 모두 `string`). `ItemCard`의 prop 타입으로 씀
  - `src/lib/mock-items.ts` — 더미 9개. 예외 4종(mock-3 이미지 없음, mock-5 깨진 이미지 주소, mock-7 링크 없음, mock-8 "기타")이 섞여 있지만 **이 Task에서는 따로 처리하지 않는다.** 이미지가 빈 카드·깨진 카드는 브라우저 기본 모양(빈 영역·깨진 이미지 아이콘)으로 보여도 정상이며 Task 004에서 대체 그림으로 바꾼다
  - `src/components/features/wishlist/wishlist-view.tsx` — `items: Item[]` prop을 받아 `<p>`로 개수만 그리는 현재 모습. 이 prop 구조는 유지
  - `src/components/ui/card.tsx` — shadcn `Card`(`flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) ring-1 …`)와 `CardContent`(`px-(--card-spacing)`). `Card`는 `<img>`가 **첫 직계 자식**일 때만 위 여백을 자동으로 없앤다(`has-[>img:first-child]:pt-0`). 이 Task는 Task 004의 대체 그림을 대비해 이미지를 `div`로 감싸므로 `Card`에 `pt-0`을 직접 준다
  - `src/components/ui/badge.tsx` — shadcn `Badge`(`variant`: `default`·`secondary`·`outline` 등). 종류 배지에 `variant="secondary"`를 씀
  - `src/components/common/page-header.tsx` — 페이지 제목·설명 묶음. 이미 `page.tsx`에서 쓰고 있으며 고치지 않음
  - `src/lib/utils.ts` — `cn()` (클래스 이름 합치기)
- 읽을 규칙:
  - `CLAUDE.md` "프로젝트 문서" — 외부 이미지는 `next/image` 대신 일반 `<img>`를 쓴다
  - `CLAUDE.md` "구조" — 계층 `lib` → `components/ui` → `features/<기능>` → `app` (features는 `lib`·`ui`만 import, `app`을 import하지 않음). `<main>`은 틀이 그리므로 넣지 않음
  - `CLAUDE.md` "코드 규칙" — kebab-case 파일 이름, named export, `"use client"`는 상태·이벤트 핸들러가 필요한 파일에만, 한국어 문구, 색은 토큰 클래스(`bg-card`·`bg-muted`·`text-muted-foreground` 등. `src/app/globals.css`에 정의), 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음), 주석 한국어
  - `.claude/rules/library-docs.md` — Tailwind 클래스(`aspect-square`, `grid-cols-*`, `line-clamp-*`)가 헷갈리면 `https://tailwindcss.com/docs/<주제>` 확인. `tailwind.config` 고치는 안내는 v3 방식이므로 따르지 않음. shadcn 부품 사용법은 `npx shadcn docs card`
  - `docs/prd/prd.md` F001 행, "페이지별 상세 기능" 표의 주요 기능, 가정 "카드 이미지 크기"
  - ESLint의 `@next/next/no-img-element` 경고가 나면 그 줄에 `{/* eslint-disable-next-line @next/next/no-img-element -- 외부 이미지는 일반 img 사용 (CLAUDE.md) */}`를 붙인다. `next.config.ts`나 `eslint.config.mjs`는 고치지 않는다

## 명세

> 2026-10-11 디자인 변경: 아래 명세·구현 단계의 shadcn `Card`·`pt-0`·`gap-4`는 처음 구현 기준이다. 참고 디자인 반영으로 `Card` 부품을 쓰지 않고 테두리 없는 둥근 이미지 + 아래 글자로 바꿨다. 현재 모양은 맨 아래 "변경 요약"의 디자인 다듬기 줄과 `plans/2026-10-11-project-notion-cms-card-design-plan.md` 참조

- **`src/components/features/wishlist/item-card.tsx`** — `ItemCard` named export, prop `item: Item`
  - shadcn `Card`를 바깥 틀로 쓴다. `className`에 `pt-0`(이미지가 카드 맨 위에 붙게)과 `gap-3` 정도의 간격을 준다. `overflow-hidden`·`rounded-xl`·`bg-card`·`ring-1`은 `Card`가 이미 가지고 있으므로 다시 쓰지 않는다
  - **이미지 영역**: `div`(`aspect-square w-full overflow-hidden bg-muted`) 안에 일반 `<img>`를 둔다. `src={item.imageUrl}`, `alt={item.name}`, `className="size-full object-cover"`, `loading="lazy"`. `next/image`는 쓰지 않는다 (외부 쇼핑몰 주소라 도메인 허용 설정을 피하기 위해, `CLAUDE.md`). 이 Task에서는 `imageUrl`이 비어 있어도 분기하지 않는다 — 대체 그림(`bg-muted` + `ImageOff` 아이콘)과 `onError`는 Task 004
  - **본문**: `CardContent` 안에 이름과 배지. 이름은 `<p>`(`line-clamp-2 text-sm font-medium`, 두 줄까지만 보이고 넘치면 말줄임). 배지는 `Badge variant="secondary"`에 `item.category`를 그대로 넣는다 ("기타"도 값 그대로. 흐리게 하는 건 Task 004의 링크 없는 카드 처리)
  - 이 Task에서는 카드를 `<a>`로 감싸지 않는다 (F002 링크 처리는 Task 004). `"use client"`를 붙이지 않는다. 글자색·배경은 토큰 클래스만 쓴다
- **`src/components/features/wishlist/item-grid.tsx`** — `ItemGrid` named export, prop `items: Item[]`
  - `<ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">`에 `items.map`으로 `<li key={item.id}><ItemCard item={item} /></li>`를 나열한다. 휴대폰(기본) 2열, 데스크톱(`lg`, 1024px 이상) 4열이 F001 반응형 요구. 중간 폭(`md`) 3열은 PRD에 없으므로 넣지 않는다 (넣고 싶으면 Task 004 이후 판단)
  - `items`가 비어 있을 때의 "아직 소품이 없어요" 빈 상태는 Task 005. 이 Task에서는 빈 배열이면 빈 그리드가 그려져도 된다
  - `"use client"` 없음. 색은 토큰 클래스, 문구 없음(있다면 한국어)
- **`src/components/features/wishlist/wishlist-view.tsx`** 고치기
  - `<p>소품 N개</p>`를 지우고 `<ItemGrid items={items} />`를 그린다. prop 타입 `WishlistViewProps`(`items: Item[]`)는 그대로 둔다
  - 파일 맨 위 주석을 현재 상태에 맞게 고친다 (예: "소품 목록 화면. 지금은 카드 그리드만 그리고, Task 005에서 종류 칩과 빈 상태가 들어간다")
  - 아직 `"use client"`를 붙이지 않는다 (칩 선택 `useState`는 Task 005)
- **공통**: 파일 이름 kebab-case, 컴포넌트 named export, 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음), 주석 한국어, `any` 금지. `features/wishlist/`는 `@/lib/*`와 `@/components/ui/*`만 import한다

## 구현 단계

- [x] 1. `src/components/features/wishlist/item-card.tsx` 만들기 — `Card`(`pt-0`) 안에 이미지 영역 `div`(`aspect-square w-full overflow-hidden bg-muted`) + 일반 `<img>`(`size-full object-cover`, `alt`는 이름, `loading="lazy"`), `CardContent`에 이름 `<p>`(`line-clamp-2`)와 `Badge variant="secondary"`로 종류. `"use client"` 없음, 링크·대체 그림 분기 없음
- [x] 2. `src/components/features/wishlist/item-grid.tsx` 만들기 — `items: Item[]`를 받아 `<ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">`에 `<li key={item.id}>`로 `ItemCard` 나열
- [x] 3. `src/components/features/wishlist/wishlist-view.tsx` 고치기 — "소품 N개" `<p>` 제거, `<ItemGrid items={items} />`로 교체, 맨 위 주석 현행화
- [x] 4. `npm run lint` → `npm run build` (`no-img-element` 경고가 나면 해당 줄에 한국어 이유를 적은 eslint 주석으로 처리)
- [x] 5. 브라우저 확인 — `npm run dev`가 켜져 있는지 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 확인 후 `/`를 열어 휴대폰 폭(375px)과 데스크톱 폭(1280px)에서 열 수를 확인하고 스크린샷을 `.playwright-mcp/task-003-mobile.png`·`.playwright-mcp/task-003-desktop.png`로 저장

## 완료 기준

- [x] `npm run lint` 통과
- [x] `npm run build` 통과 (build 라우트 표에서 `/`가 여전히 Revalidate 5m으로 표시됨 — Task 001의 `revalidate = 300`이 유지됐다는 뜻)
- [x] 브라우저 확인: `/`에 더미 소품 9개가 카드로 보이고, 각 카드에 정사각형 이미지 · 이름 · 종류 배지(mock-8은 "기타")가 있음. 카드 순서는 `mockItems` 배열 순서(mock-1이 맨 앞)
- [x] 브라우저 확인: 휴대폰 폭(375px)에서 2열, 데스크톱 폭(1280px)에서 4열
- [x] 브라우저 확인: "소품 N개" 문구가 사라짐. mock-3(이미지 없음)·mock-5(깨진 주소) 카드는 이미지 영역이 비거나 깨진 아이콘이 보여도 **이 Task에서는 정상** (Task 004에서 대체 그림으로 교체). 카드를 눌러도 아무 일이 없는 것도 정상 (Task 004에서 링크 처리)
- [x] `src/app/(marketing)/page.tsx`·`src/lib/items.ts`·`src/lib/mock-items.ts`에 변경 없음, 새 파일에 `"use client"` 없음

## 변경 요약

- 새로 만든 파일: `src/components/features/wishlist/item-card.tsx` — `ItemCard`(`Card`에 `gap-3 pt-0`, `aspect-square` `div` 안에 일반 `<img>`(`size-full object-cover`, `loading="lazy"`), `CardContent`에 이름 `<p>`(`line-clamp-2`)와 `Badge variant="secondary"` 종류). `src/components/features/wishlist/item-grid.tsx` — `ItemGrid`(`<ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">`, `<li key={item.id}>`로 나열)
- 고친 파일: `src/components/features/wishlist/wishlist-view.tsx` — "소품 N개" `<p>`를 `<ItemGrid items={items} />`로 교체, 맨 위 주석 현행화. prop 타입은 그대로
- 결정 사항: `@next/next/no-img-element` 경고가 실제로 나는 것을 확인(`npx eslint --no-inline-config`)해, 작업 파일대로 `<img>` 줄 위에 한국어 이유를 적은 `eslint-disable-next-line` 주석을 붙임. 설정 파일은 손대지 않음. `CardContent`에 `flex flex-col gap-2`를 줘 이름과 배지를 세로로 쌓음(배지가 `inline-flex`라 줄 바꿈 없이 이름 옆에 붙지 않게). 새 파일 모두 `"use client"` 없음, `features/wishlist/`는 `@/lib/*`·`@/components/ui/*`와 같은 폴더 안 파일만 import
- 확인: lint 통과(경고 0), build 통과, 라우트 표에서 `/` Revalidate 5m 유지. `page.tsx`·`items.ts`·`mock-items.ts`·`src/components/ui/` 변경 없음
- 브라우저 확인 결과(Claude in Chrome, dev 서버): 1280px 창에서 4열, 375px 폭(창 최소 폭 제한으로 페이지 안에 375px iframe을 띄워 확인)에서 2열, `<li>` 9개, mock-1 "오크 원목 사이드 테이블"이 맨 앞, mock-8 배지 "기타", "소품 9개" 문구 없음. 스크린샷 `.playwright-mcp/task-003-desktop.png`·`.playwright-mcp/task-003-mobile.png`. mock-3(이미지 없음)은 `src=""`라 alt 글자만 보이고 콘솔에 React 오류 1건("An empty string was passed to the src attribute")이 찍힘 — Task 004에서 `imageUrl`이 비면 `<img>`를 그리지 않고 대체 그림을 쓰면 사라지므로 이 Task에서는 그대로 둠. mock-5(깨진 주소)는 빈 영역
- 디자인 다듬기(2026-10-11, 참고 이미지 반영, 계획 `plans/2026-10-11-project-notion-cms-card-design-plan.md`): `ItemCard`에서 shadcn `Card` 부품을 빼고 테두리·배경 없는 둥근 이미지(`rounded-2xl bg-muted`) + 아래 이름(`font-semibold`)·작은 배지로 바꿈. `ItemGrid` 세로 간격 `gap-y-6`. 정사각형·배지·2열/4열은 그대로라 PRD 변경 없음. lint·build 통과, 라이트·다크·375px 확인(`.playwright-mcp/task-003-design-desktop.png`·`-desktop-light.png`·`-mobile.png`)
- 남긴 일: 대체 그림·`onError`·링크 `<a>`·"기타" 흐림은 Task 004, 종류 칩·빈 상태는 Task 005
