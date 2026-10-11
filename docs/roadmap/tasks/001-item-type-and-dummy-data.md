# Task 001: Item 타입·더미 데이터·화면 부품 자리 만들기

담당 기능: 기반 (전 기능 공통), F010 · Phase 1 · 상태: 완료

## 목표

PRD 데이터 모델의 `Item`(화면용 변환 객체)을 타입으로 정하고, Phase 2에서 모든 화면 상태(정상·이미지 없음·깨진 이미지·링크 없음·"기타")를 눌러 볼 수 있는 더미 소품 데이터를 만든다. `features/wishlist/` 폴더에 화면 부품 자리(`WishlistView`)를 두고, 소품 목록 페이지(`/`)에 F010의 `export const revalidate = 300`(ISR) 자리를 잡는다. 이 Task가 끝나면 `/`에서 사이트 제목·설명과 "소품 N개" 문구가 보이고, build 출력에서 `/`가 300초 재검증 페이지로 표시된다.

## 관련 파일

- 새로 만들 파일:
  - `src/lib/items.ts` (`Item` 타입, `OTHER_CATEGORY` 상수)
  - `src/lib/mock-items.ts` (`mockItems: Item[]` 더미 데이터)
  - `src/components/features/wishlist/wishlist-view.tsx` (`WishlistView` 최소 컴포넌트)
- 고칠 파일:
  - `src/app/(marketing)/page.tsx` (`revalidate` 추가, `WishlistView` 연결, 설명 교체)
- 참고할 기존 코드:
  - `src/app/(marketing)/page.tsx` — 현재는 `PageHeader` 하나에 자리 표시 문구("소품 목록 페이지 자리입니다. F001에서 카드 그리드가 들어갑니다.")만 있음
  - `src/lib/site.ts` — `siteConfig.description`("사고 싶은 인테리어 소품을 Notion 표에 적으면 카드 한 화면으로 모아 보여 주는 읽기 전용 사이트")을 페이지 설명으로 씀
  - `src/components/common/page-header.tsx` — `title`·`description`·`children` prop을 받는 페이지 제목 + 설명 묶음. 그대로 활용하고 고치지 않음
- 읽을 규칙:
  - `CLAUDE.md` "프로젝트 문서"(`revalidate = 300`, `cacheComponents` 안 켬), "구조"(계층 `lib` → `features` → `app`, `<main>`은 틀이 그림), "코드 규칙"(kebab-case, named export, 한국어 문구, 토큰 색, shadcn 스타일: 큰따옴표·세미콜론 없음)
  - `docs/prd/prd.md` "데이터 모델" 절의 `Item` 표와 "Living Wishlist" 열 설명, F010 행
  - Next.js 문서 `node_modules/next/dist/docs/`에서 `revalidate` 세그먼트 설정(route segment config) 확인 (`AGENTS.md` 안내대로 기억이 아닌 설치된 문서 기준)

## 명세

- `src/lib/items.ts`: PRD 데이터 모델의 `Item` 타입을 정의한다. 필드는 `id`(Notion 페이지(행) 고유 식별자)·`name`(이름)·`url`(상품 링크)·`imageUrl`(이미지 URL)·`category`(종류). 모두 `string`이고 없는 값은 빈 문자열(`""`)로 둔다. `category`는 비어 있지 않게 유지하며 비면 `"기타"`다(ROADMAP 가정: "기타" 치환은 Notion 매핑 단계에서 하고 화면은 값을 그대로 씀). 상수 `OTHER_CATEGORY = "기타"`를 함께 export한다. `any` 금지
- `src/lib/mock-items.ts`: `Item[]` 타입의 더미 소품 **8~10개**를 `mockItems`로 named export한다. 조건:
  - 종류는 PRD 시작 선택지 **가구·조명·화분·수납·러그·소품** 여섯 가지를 섞어 넣는다
  - **이미지 URL이 없는 것**(`imageUrl: ""`) 1개 이상
  - **이미지 주소가 깨진 것**(존재하지 않는 URL) 1개 이상
  - **상품 링크가 없는 것**(`url: ""`) 1개 이상
  - **종류가 없는 것**(`category: OTHER_CATEGORY`, 즉 `"기타"`) 1개 이상
  - 나머지는 이미지·링크·종류가 모두 있는 정상 데이터로, Phase 2에서 모든 화면 상태를 눌러 볼 수 있게 한다
  - 배열 순서 = "최근 추가가 위" (배열 맨 앞이 가장 최근에 추가한 소품이라고 가정). 화면은 배열 순서 그대로 그린다
  - 이 파일은 Phase 2 확인용이며 Task 006(Notion 연결)에서 삭제한다
- `src/components/features/wishlist/wishlist-view.tsx`: 폴더 `src/components/features/wishlist/`를 새로 만들고, `items: Item[]` prop을 받아 소품 개수만 한국어("소품 N개")로 보여 주는 최소 컴포넌트 `WishlistView`를 named export한다. 상태·이벤트 핸들러가 없으므로 아직 `"use client"`를 붙이지 않는다. 색은 토큰 클래스(`text-muted-foreground` 등)만 쓴다
- `src/app/(marketing)/page.tsx`:
  - `export const revalidate = 300` 추가 (F010 자리, ISR. `cacheComponents`는 켜지 않는다. `next.config.ts`는 건드리지 않는다)
  - `mockItems`를 import해 `<WishlistView items={mockItems} />`로 넘긴다
  - `PageHeader`의 `description`을 자리 표시 문구에서 `siteConfig.description`으로 교체한다. `title={siteConfig.title}`은 그대로
  - `<main>`은 `(marketing)/layout.tsx` 틀이 이미 그리므로 넣지 않는다. 페이지는 서버 컴포넌트로 남긴다
- 공통: 파일 이름 kebab-case, 컴포넌트 named export, 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음), 주석은 한국어

## 구현 단계

- [x] 1. `src/lib/items.ts` 만들기 — `Item` 타입(`id`·`name`·`url`·`imageUrl`·`category`, 모두 `string`)과 `OTHER_CATEGORY = "기타"` 상수 export
- [x] 2. `src/lib/mock-items.ts` 만들기 — `mockItems: Item[]` 8~10개 (종류 6가지 섞기, 이미지 없음·깨진 주소·링크 없음·"기타" 각 1개 이상, 맨 앞이 최근 추가)
- [x] 3. `src/components/features/wishlist/wishlist-view.tsx` 만들기 — `items: Item[]` prop으로 "소품 N개" 문구만 그리는 `WishlistView` (named export, `"use client"` 없음)
- [x] 4. `src/app/(marketing)/page.tsx` 고치기 — `export const revalidate = 300` 추가, `PageHeader` 설명을 `siteConfig.description`으로 교체, `<WishlistView items={mockItems} />` 연결
- [x] 5. `npm run lint` → `npm run build` → 브라우저(`npm run dev`, 켜져 있는지 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 먼저 확인)에서 `/` 확인, 스크린샷은 `.playwright-mcp/`에 저장

## 완료 기준

- [x] `npm run lint` 통과
- [x] `npm run build` 통과
- [x] 브라우저 확인: `/`에 사이트 제목("Living Wishlist")·설명(`siteConfig.description`)과 "소품 N개" 문구(N은 더미 개수 8~10)가 보임
- [x] build 출력에서 `/`가 `revalidate` 300초(ISR)로 표시됨 (정적 페이지에 재검증 주기가 붙은 표시)

## 변경 요약

- 새로 만든 파일: `src/lib/items.ts`(`Item` 타입, `OTHER_CATEGORY`), `src/lib/mock-items.ts`(`mockItems` 9개), `src/components/features/wishlist/wishlist-view.tsx`(`WishlistView`, "소품 N개")
- 고친 파일: `src/app/(marketing)/page.tsx` — `export const revalidate = 300`, `PageHeader` 설명을 `siteConfig.description`으로, `<WishlistView items={mockItems} />` 연결
- 결정 사항: 더미 이미지는 `https://picsum.photos/seed/<이름>/600/600`(정상), `https://example.com/missing/<이름>.jpg`(깨진 주소). 예외 4종은 mock-3(이미지 없음)·mock-5(깨진 주소)·mock-7(링크 없음)·mock-8("기타")
- 확인: lint·build 통과, build 라우트 표에서 `/` Revalidate 5m, 브라우저에서 제목·설명·"소품 9개" 확인(`.playwright-mcp/task-001-home.png`). 콘솔 hydration 오류 1건은 Chrome 확장 프로그램(ClickUp)이 body class를 바꿔서 생긴 것으로 코드와 무관
- 남긴 일: 없음. 다음은 Task 002(Notion SDK 설치·연결 준비)
