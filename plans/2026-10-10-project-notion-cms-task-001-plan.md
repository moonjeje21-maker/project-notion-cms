# Task 001 구현 계획: Item 타입·더미 데이터·화면 부품 자리

## Context

로드맵 Phase 1의 첫 Task. 명세는 `docs/roadmap/tasks/001-item-type-and-dummy-data.md`에 있고 이 계획은 다시 적지 않는다. 여기에는 실제 수정 순서와 확인 방법만 적는다. 끝나면 `/`에서 사이트 제목·설명과 "소품 N개"가 보이고, build 출력에서 `/`가 300초 재검증(ISR) 페이지로 표시된다.

확인한 사실: Next.js 16.3.8 문서(`node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md`)에서 `export const revalidate = 300`은 `cacheComponents`를 켜지 않은 이 프로젝트에서 그대로 동작한다. `next.config.ts`는 비어 있어 손대지 않는다.

## 수정 순서 (작업 파일의 구현 단계 1~5와 같음, 한 단계씩 진행하고 체크박스를 채운다)

1. **`src/lib/items.ts` 새로 만들기**: `Item` 타입(필드 5개 모두 `string`)과 `OTHER_CATEGORY = "기타"` 상수. 한국어 주석으로 각 필드 뜻을 적는다
2. **`src/lib/mock-items.ts` 새로 만들기**: `mockItems: Item[]` 9개. 정상 이미지는 `https://picsum.photos/seed/<이름>/600/600`(무료 자리 표시 이미지 서비스, 같은 seed면 같은 그림), 깨진 주소는 `https://example.com/missing/<이름>.jpg`. 포함할 예외 4종: 이미지 없음(`imageUrl: ""`) 1개, 깨진 주소 1개, 링크 없음(`url: ""`) 1개, `category: OTHER_CATEGORY` 1개. 나머지 5개는 가구·조명·화분·수납·러그·소품을 고루 섞은 정상 데이터. `id`는 `"mock-1"`~`"mock-9"`. 배열 맨 앞이 최근 추가
3. **`src/components/features/wishlist/wishlist-view.tsx` 새로 만들기**: `items: Item[]` prop, `<p className="text-muted-foreground">소품 {items.length}개</p>` 하나만. named export, `"use client"` 없음
4. **`src/app/(marketing)/page.tsx` 고치기**: 맨 위에 `export const revalidate = 300`(한국어 주석: 5분마다 Notion 다시 읽는 자리), `mockItems`·`WishlistView` import, `PageHeader description={siteConfig.description}`, 그 아래 `<WishlistView items={mockItems} />`. 두 요소를 나란히 두기 위해 fragment(`<>…</>`)로 감싼다. `<main>`은 틀이 그리므로 넣지 않는다
5. **확인**: 아래 검증 절

## 재사용하는 기존 코드

- `src/components/common/page-header.tsx`의 `PageHeader` (그대로)
- `src/lib/site.ts`의 `siteConfig.title`·`siteConfig.description`
- `(marketing)/layout.tsx`가 `<main>`과 여백을 이미 그림

## 검증

1. `npm run lint`
2. `npm run build` — 출력의 라우트 표에서 `/`에 재검증 주기 표시(ISR 표식 또는 `revalidate: 300`)가 붙는지 확인
3. `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 dev 서버 확인 후 없으면 `npm run dev`. Claude in Chrome으로 `http://localhost:3000` 열어 제목 "Living Wishlist", `siteConfig.description` 문구, "소품 9개"가 보이는지 확인. 스크린샷은 `.playwright-mcp/task-001-home.png`
4. 작업 파일 체크박스와 "변경 요약" 작성, 계획 파일을 `plans/2026-10-10-project-notion-cms-task-001-plan.md`로 옮기고 완료 상태 추가
5. `development-planner`에게 "Task 001 완료로 바꿔줘" → ROADMAP 갱신(우선순위를 Task 002로 이동). 커밋은 사용자가 `/ship`으로

## 범위 밖

- 카드·그리드·칩(Task 002~004), Notion 연결(Task 005~)
- `next.config.ts`, `site.ts`, `page-header.tsx` 수정 없음

## 완료 상태 (2026-10-10)

- ✅ 1~4단계 파일 작성, 5단계 확인(lint·build 통과, `/` Revalidate 5m, 브라우저 "소품 9개", 스크린샷 `.playwright-mcp/task-001-home.png`)
- ✅ 작업 파일 `docs/roadmap/tasks/001-item-type-and-dummy-data.md` 체크박스·변경 요약 작성, 상태 완료
- ROADMAP 갱신은 development-planner로, 커밋은 `/ship`으로

## 남은 작업

- 없음
