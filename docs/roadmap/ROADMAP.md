# Living Wishlist 개발 로드맵

사고 싶은 인테리어 소품을 Notion 표에 "이름 + 상품 링크"만 적으면 웹 한 화면에 카드로 모아 보여 줘서, 흩어진 후보를 한곳에서 훑어보고 구매를 결정할 수 있게 한다.

작성일: 2026-10-10 · 기준 PRD: `docs/prd/prd.md` · 접근법: 구조 우선 (구조 → UI → 데이터)

## 📌 가정

- **파일 자리**: PRD는 `Item` 타입과 Notion 연동 코드의 폴더를 정하지 않았다. `CLAUDE.md` 계층 규칙에 따라 데이터·도우미는 `src/lib/`에 둔다 — 타입 `src/lib/items.ts`, 더미 데이터 `src/lib/mock-items.ts`, Notion 연동(열 이름 ↔ `Item` 매핑 포함) `src/lib/notion.ts`. 화면 부품은 `src/components/features/wishlist/`에 둔다 (`item-card.tsx`, `item-grid.tsx`, `category-chips.tsx`, `wishlist-view.tsx`)
- **Notion 열 타입**: "상품 링크"·"이미지 URL" 열은 Notion **URL 속성**으로 가정한다. 실제 타입이 다르면(예: 텍스트) `src/lib/notion.ts`의 매핑만 고친다
- **"기타" 처리 시점**: `Item.category`는 비어 있지 않게 유지한다. Notion "종류"가 비어 있으면 매핑 단계(`src/lib/notion.ts`)에서 `"기타"`로 바꿔 넣고, 화면은 `category` 값을 그대로 배지와 칩에 쓴다. 더미 데이터에도 `"기타"` 소품을 하나 넣어 화면 Phase에서 미리 확인한다
- **더미 데이터의 수명**: 더미 데이터 `src/lib/mock-items.ts`는 Phase 2(화면) 확인용이며, Notion 연결(Task 006)에서 실제 데이터로 바꾼 뒤 삭제한다
- **클라이언트 경계**: 이미지 깨짐 감지(`onError`)와 칩 선택 상태는 브라우저에서만 동작하므로 `item-card.tsx`·`category-chips.tsx`·`wishlist-view.tsx`에 `"use client"`를 붙인다. 소품 목록 페이지(`page.tsx`)는 서버 컴포넌트로 남겨 Notion을 읽고 `items`를 props로 넘긴다
- **페이지 머리 영역**: 현재 `page.tsx`의 `PageHeader`는 그대로 두고, 자리 표시 문구만 사이트 설명(`siteConfig.description`)으로 바꾼다. 머리글의 사이트 이름·다크 모드 버튼은 PRD 가정대로 손대지 않는다
- **빌드 시 Notion 접근**: Task 006부터 `npm run build`가 빌드 중 Notion을 읽어 `/`를 미리 만들므로, `.env.local`과 네트워크가 있어야 build가 통과한다. 환경변수가 없으면 `src/lib/notion.ts`가 한국어 메시지로 바로 오류를 던지게 해 원인을 알 수 있게 한다
- **배포 Phase**: PRD 기술 스택에 Vercel이 "다음 단계에 예정"으로 있고 F011이 "배포 전에 Vercel 환경변수를 먼저 등록한다"고 하므로 Phase 4(배포)를 둔다. Vercel 계정·GitHub 연결은 사용자가 Vercel 화면에서 직접 한다

## 개요

본인(Notion에서 입력)과 주소를 공유받은 지인 몇 명(웹에서 읽기 전용)을 위한, 로그인 없는 "인테리어 소품 후보 모아보기" 사이트. 화면은 소품 목록 페이지(홈) 하나다. 기능은 PRD 기능 명세의 ID를 따릅니다:

- **F001 소품 목록 카드 그리드**: Notion 소품 전체(이름·상품 링크·종류·이미지 URL)를 카드(이미지·이름·종류 배지)로, 최근 추가가 위에, 휴대폰 2열·데스크톱 4열로 보여 준다
- **F002 구매 링크 새 탭 열기**: 카드를 누르면 상품 링크가 새 탭(`target="_blank"` + `rel="noopener noreferrer"`)으로 열리고, 링크가 비어 있으면 이동하지 않는다
- **F003 종류 칩 필터**: 상단 "전체" + 종류 칩. 브라우저 안에서만 거르고 주소는 바뀌지 않는다. 칩은 소품들의 종류 값에서 자동 생성된다
- **F004 빈 상태·대체 이미지 표시**: 소품 0개 → "아직 소품이 없어요", 필터 결과 0개 → "이 종류의 소품이 없어요". 이미지 없음·깨짐 → 회색 배경 + 아이콘, 종류 없음 → "기타" 배지
- **F010 Notion 자동 갱신**: 소품 목록 페이지에 `export const revalidate = 300`(ISR). 약 5분 뒤 방문 시 뒤에서 다시 읽는다. `cacheComponents`는 켜지 않는다
- **F011 Notion 연결 오류 표시**: Notion 읽기 실패 시 공용 오류 화면(`app/error.tsx`, "다시 시도" = `retry` prop). 배포 전에 Vercel 환경변수(`NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`)를 먼저 등록한다

## 개발 워크플로우

1. **작업 선택**: ROADMAP에서 `- 우선순위` 표시된 Task를 고릅니다
2. **작업 파일 생성**: `development-planner`에게 "Task XXX 작업 파일 만들어줘" → `docs/roadmap/tasks/XXX-설명.md` 생성 (형식은 `docs/roadmap/tasks/000-sample.md`)
3. **구현**: plan 모드로 계획을 세워 승인받고 `plans/`에 저장합니다 (계획 파일은 작업 파일의 명세를 다시 적지 않고 `docs/roadmap/tasks/XXX-설명.md`를 가리키며, 실제 수정 순서와 검증만 적습니다). 작업 파일의 구현 단계를 따라 구현하고, 단계마다 체크박스를 채웁니다
4. **확인**: `npm run lint` → `npm run build` → 브라우저 확인(스크린샷은 `.playwright-mcp/`). Notion 자동 갱신은 `npm run build && npm run start`
5. **마무리**: 작업 파일에 변경 요약을 적고, `development-planner`에게 "Task XXX 완료로 바꿔줘" → ROADMAP 갱신. 커밋은 `/ship`

## 활용하는 기존 코드 (다시 만들지 않음)

- 화면 틀 `src/app/(marketing)/layout.tsx` (`<main>` 포함, 머리글 `site-header` + 바닥글 `site-footer` + 휴대폰 서랍 `mobile-nav`)
- 공용 오류 화면 `src/app/error.tsx` (`retry` prop, "다시 시도" 버튼, 한국어 문구) · 404 `src/app/not-found.tsx`
- `src/components/common/page-header.tsx` (페이지 제목 + 설명) · `logo.tsx` · `theme-toggle.tsx`
- shadcn 부품 `src/components/ui/`: `badge`(종류 배지), `button`(칩), `card`(소품 카드), `empty`(빈 상태) · 아이콘 `lucide-react`
- `src/lib/site.ts` (사이트 이름·메뉴, 이미 Living Wishlist 값) · `src/lib/utils.ts`의 `cn()`
- `.gitignore`의 `.env*` 규칙 (`.env.local`이 git에 올라가지 않음)

## 개발 단계

### Phase 0: 준비 ✅

- **Task 000: 스타터 킷 예제 정리** ✅ - 완료
  - 담당 기능: 기반 (전 기능 공통)
  - See: `plans/2026-10-10-project-notion-cms-starter-cleanup-plan.md`
  - ✅ `(dashboard)` 경로, 사이드바·대시보드 틀 조각, `features/home/` 데모, `lib/stack.ts`, `hooks/use-mobile.ts`, 미사용 shadcn 부품 21개 삭제, `npm uninstall sonner`
  - ✅ `lib/site.ts`를 Living Wishlist 값으로(`mainNav` "홈" 하나, `footerNav` 빈 배열), `(marketing)/page.tsx`는 `PageHeader` 자리 표시 문구만, `app/layout.tsx`에서 Toaster·TooltipProvider 제거, `next.config.ts` 비움
  - ✅ `README.md`·`CLAUDE.md`·`.claude/rules/`·PRD의 낡은 문장 수정. `npm run lint`·`npm run build` 통과 (라우트 `/`·`/_not-found`)

### Phase 1: 뼈대 (구조)

- **Task 001: Item 타입·더미 데이터·화면 부품 자리 만들기** - 우선순위
  - 담당 기능: 기반 (전 기능 공통), F010
  - `src/lib/items.ts`: PRD 데이터 모델의 `Item` 타입(`id`·`name`·`url`·`imageUrl`·`category`, 모두 `string`, 없는 값은 빈 문자열, `category`는 비면 `"기타"`)과 상수 `OTHER_CATEGORY = "기타"`
  - `src/lib/mock-items.ts`: `Item[]` 더미 소품 8~10개. 종류 가구·조명·화분·수납·러그·소품을 섞고, 이미지 URL 없는 것·깨진 주소인 것·상품 링크 없는 것·종류 없는(`"기타"`) 것을 각 1개 이상 포함해 Phase 2에서 모든 화면 상태를 눌러 볼 수 있게 한다. 순서는 "최근 추가가 위"로 가정한 배열 순서
  - `src/components/features/wishlist/` 폴더와 `wishlist-view.tsx` 자리: `items: Item[]` prop을 받아 소품 개수만 한국어로 보여 주는 최소 컴포넌트(named export, 아직 `"use client"` 없음)
  - `src/app/(marketing)/page.tsx`: `export const revalidate = 300` 추가(F010 자리, `cacheComponents`는 켜지 않음), `mockItems`를 `WishlistView`에 넘김, `PageHeader` 설명을 `siteConfig.description`으로 교체
  - 완료 기준: lint·build 통과, 브라우저에서 `/`에 사이트 제목·설명과 "소품 N개" 문구가 보임, build 출력에서 `/`가 `revalidate` 300초(ISR)로 표시됨

### Phase 2: 화면 (UI, 더미 데이터)

- **Task 002: 기본 소품 카드와 카드 그리드 만들기**
  - 담당 기능: F001
  - `src/components/features/wishlist/item-card.tsx`: shadcn `Card` 안에 정사각형 이미지 영역(`aspect-square`, 일반 `<img>` + `object-cover`, `next/image` 사용 안 함, `alt`는 소품 이름), 이름, 종류 `Badge`. 이 Task에서는 `"use client"` 없이 정상 데이터(이미지·링크·종류가 모두 있는 소품)만 그린다. 대체 그림·링크 처리는 Task 003
  - `src/components/features/wishlist/item-grid.tsx`: `items: Item[]`를 받아 `grid grid-cols-2 gap-4 lg:grid-cols-4`로 `ItemCard`를 나열(F001 반응형). 색은 토큰 클래스만, 문구는 한국어
  - `wishlist-view.tsx`에서 개수 문구를 지우고 `ItemGrid`를 그림
  - 완료 기준: lint·build 통과, 브라우저에서 휴대폰 폭(375px) 2열·데스크톱 폭(1280px) 4열, 카드마다 이미지·이름·종류 배지가 보임

- **Task 003: 카드의 예외 상태 만들기**
  - 담당 기능: F002, F004
  - `item-card.tsx`에 `"use client"` 추가(`onError` 때문). `imageUrl`이 비었거나 `onError`가 나면 `bg-muted` 배경 + `lucide-react` 아이콘(예: `ImageOff`) 대체 그림을 이미지와 같은 크기로 그림(F004). 종류가 `"기타"`면 그대로 "기타" 배지(F004)
  - 링크 처리(F002): `url`이 있으면 카드 전체를 `<a href={url} target="_blank" rel="noopener noreferrer">`로 감싸고, 없으면 `<div>`로 그려 이동이 없게 한다. 링크 없는 카드는 PRD 가정대로 기본 커서 + 흐린 배지(`opacity`·`text-muted-foreground`)로 구분
  - 완료 기준: lint·build 통과, 브라우저에서 깨진 이미지·빈 이미지 카드에 회색 대체 그림, "기타" 배지, 링크 있는 카드 클릭 시 새 탭이 열리고 원래 탭은 목록 유지, 링크 없는 카드는 클릭해도 아무 일 없음

- **Task 004: 종류 칩 필터와 빈 상태 만들기**
  - 담당 기능: F003, F004
  - `src/components/features/wishlist/category-chips.tsx` (`"use client"`): `categories: string[]`·`selected: string`·`onSelect` prop. "전체" 칩이 맨 앞, 선택된 칩은 `Button variant="default"`, 나머지는 `variant="outline"` (`size="sm"`, `aria-pressed`). 가로 스크롤 가능한 `flex flex-wrap gap-2`
  - `wishlist-view.tsx`에 `"use client"`와 `useState`로 선택 종류 상태를 둔다(기본 "전체"). 칩 목록은 `items`의 `category`를 등장 순서대로 중복 제거해 만들고, `"기타"`가 있으면 맨 끝으로 보낸다(PRD 가정). 필터는 브라우저 안에서만, 주소(쿼리)는 바꾸지 않는다 — `useSearchParams`·`router.push` 사용 금지(F010 캐시 보호)
  - 빈 상태 2종(F004, shadcn `Empty` 사용): `items.length === 0`이면 칩을 숨기고 "아직 소품이 없어요"; 필터 결과 0개면 칩은 그대로 두고 "이 종류의 소품이 없어요"
  - 더미 데이터로 두 빈 상태를 확인하기 위해 `mock-items.ts`에 빈 배열을 잠시 넘기거나, 소품이 없는 종류를 임시로 포함해 확인한 뒤 되돌린다 (코드로 남기지 않음)
  - 완료 기준: lint·build 통과, 브라우저에서 칩 클릭 시 해당 종류 카드만 보이고 주소가 바뀌지 않음, "전체" 클릭 시 전체 복귀, 선택 칩 강조, "기타" 칩이 맨 끝, 소품 0개 화면에 칩 없이 "아직 소품이 없어요", 필터 결과 0개에 "이 종류의 소품이 없어요"

### Phase 3: Notion 연결 (데이터)

- **Task 005: Notion SDK 설치와 연결 준비하기**
  - 담당 기능: 기반 (전 기능 공통), F011
  - `.claude/rules/dependencies.md`·`.claude/rules/library-docs.md`를 먼저 읽고 `@notionhq/client` **5.x** 설치(`npm view @notionhq/client version`으로 현재 버전 확인, 설치 후 `node_modules/@notionhq/client`의 `*.d.ts`로 `dataSources.query`와 전체 행 수집 도우미 이름(`collectPaginatedAPI` 등) 확인). `README.md` 기술 스택 표에 버전 추가
  - `.env.local`에 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID` (데이터 소스 ID. 데이터베이스 ID와 섞지 않음, `.gitignore`의 `.env*`로 미추적 확인). `README.md`에 두 변수 이름과 얻는 방법("데이터 소스 관리 → 데이터 소스 ID 복사") 한 절 추가
  - `src/lib/notion.ts` 1차: Notion 클라이언트 생성, 환경변수가 없으면 한국어 메시지로 오류를 던진다(F011의 원인 노출). `fetchAllRows()` — `dataSources.query`에 데이터 소스 ID, 정렬 `created_time` 내림차순(최근 추가가 위), 100개 넘어도 전부 가져오도록 전체 행 수집(`next_cursor` 반복 또는 SDK 도우미). **열 이름 ↔ `Item` 매핑은 아직 넣지 않고** SDK 응답 행을 그대로 반환한다. `any` 금지
  - `src/app/(marketing)/page.tsx`는 건드리지 않는다 (화면 연결은 Task 006)
  - 완료 기준: lint·build 통과, 터미널에서 행 개수 확인 — `node --env-file=.env.local --input-type=module -e "import('./src/lib/notion.ts').then(m => m.fetchAllRows()).then(r => console.log(r.length))"` (Node 24는 TS 파일을 바로 실행. 안 되면 `page.tsx`에 임시 `console.log`를 넣어 보고 제거). 환경변수 하나를 지우면 한국어 오류 메시지가 찍힘

- **Task 006: Notion 소품을 Item으로 바꿔 화면에 연결하기**
  - 담당 기능: F001, F010, F011
  - `src/lib/notion.ts` 2차: `getItems(): Promise<Item[]>` — `fetchAllRows()` 결과를 열 이름 ↔ `Item` 매핑("이름" 제목 → `name`, "상품 링크" → `url`, "종류" Select → `category`(비면 `"기타"`), "이미지 URL" → `imageUrl`)으로 바꾼다. 매핑은 이 파일에만 둔다. `any` 금지 — SDK 응답 타입과 타입 가드로 속성을 읽는다
  - `src/app/(marketing)/page.tsx`를 `async`로 바꿔 `await getItems()` 결과를 `WishlistView`에 넘긴다. 실패 시 오류를 잡지 않고 던져 `app/error.tsx`가 받게 한다(F011). `src/lib/mock-items.ts` 삭제
  - 완료 기준: lint·build 통과(`.env.local` 필요), 브라우저(`npm run dev`)에서 Notion의 실제 소품이 최근 추가 순으로 카드에 보이고 칩·링크·대체 이미지·"기타"가 실제 데이터로 동작

- **Task 007: 자동 갱신과 연결 오류 화면 확인하기**
  - 담당 기능: F010, F011
  - `npm run build && npm run start`로 ISR 확인(F010): 첫 방문 → Notion에서 소품 하나 추가/수정 → 5분 뒤 새로 고침 두 번에 반영되는지 확인. 개발 서버에서는 캐시가 돌지 않으므로 이 방법으로만 확인한다. build 출력에서 `/`가 300초 재검증 페이지로 표시되는지 다시 확인
  - 연결 실패 확인(F011): `.env.local`의 `NOTION_API_KEY`를 일부러 틀리게 바꾸고 `npm run dev`로 `/`를 열어 `app/error.tsx`의 "문제가 생겼습니다" + "다시 시도" 버튼이 보이는지, 값을 되돌린 뒤 "다시 시도"(`retry`)를 누르면 목록이 다시 불러와지는지 확인. 확인 뒤 `.env.local`을 원래대로 되돌린다
  - 환경변수 누락(`NOTION_DATA_SOURCE_ID` 삭제) 시 `src/lib/notion.ts`의 한국어 오류 메시지가 터미널에 찍히는지 확인하고, 메시지가 모호하면 다듬는다. 오류 화면 문구·버튼은 공용 그대로 두고 별도 페이지는 만들지 않는다(PRD 가정)
  - `README.md` 첫 문단의 "Notion 연동은 아직 없습니다"를 현재 상태로 고친다
  - 완료 기준: lint·build 통과, `npm run start`에서 5분 뒤 Notion 변경이 반영됨, 잘못된 키로 오류 화면과 "다시 시도" 동작 확인, `.env.local` 원복

### Phase 4: 배포

- **Task 008: Vercel에 배포하고 환경변수 등록하기**
  - 담당 기능: F010, F011
  - Vercel에 GitHub 저장소 `project-notion-cms` 연결(프레임워크 Next.js 자동 감지, 빌드 명령 `npm run build` 기본값). 무료 플랜
  - **첫 배포 전에** Vercel 프로젝트 설정 → Environment Variables에 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID` 등록(F011 명세). 등록하지 않으면 빌드 중 Notion 읽기가 실패해 배포가 실패한다
  - 배포 후 배포 주소에서 소품 목록·칩 필터·카드 새 탭·대체 이미지·"기타" 배지가 개발 환경과 같이 보이는지 확인. 휴대폰 실기기(또는 브라우저 휴대폰 폭)에서 2열 확인
  - F010 확인: Notion에 소품 추가 → 5분 뒤 배포 주소 새로 고침 두 번에 반영. 재생성이 실패해도 이전 내용이 유지되는 ISR 동작이므로 오류 화면이 보이지 않아야 정상
  - `README.md`에 배포 주소와 "환경변수는 Vercel 설정에서 등록" 한 줄 추가
  - 완료 기준: lint·build 통과(로컬), 배포 주소에서 전체 흐름(목록 → 칩 → 카드 새 탭) 동작, Notion 변경 5분 내 반영

## 기능 ↔ Task 대조표

| 기능 ID | 기능명 | Task |
|---|---|---|
| F001 | 소품 목록 카드 그리드 | Task 002, Task 006 |
| F002 | 구매 링크 새 탭 열기 | Task 003 |
| F003 | 종류 칩 필터 | Task 004 |
| F004 | 빈 상태·대체 이미지 표시 | Task 003, Task 004 |
| F010 | Notion 자동 갱신 | Task 001, Task 006, Task 007, Task 008 |
| F011 | Notion 연결 오류 표시 | Task 005, Task 006, Task 007, Task 008 |

기반 Task(기능 ID 없음): Task 000(스타터 정리), Task 001(타입·더미 데이터·부품 자리, F010의 `revalidate` 자리 포함), Task 005(SDK 설치·환경변수·연결 준비, F011의 환경변수 오류 포함)

## 제외 (MVP 이후)

- 소품 상세 페이지 (가격·크기가 생기면 그때)
- 가격·크기 표시와 비교, 상품 링크에서 가격·이미지 자동 수집
- 정렬 선택 (최신순 외 가격순 등)
- 필터 값을 주소에 담아 공유 (주소 쿼리 필터)
- 공간별(거실·침실 등) 필터, 이름 검색
- 비교 화면 (여러 소품 나란히 보기)
- 로그인, 웹에서 직접 입력 (입력은 Notion에서만)
- Notion Web Clipper로 저장 시 이 데이터베이스로 들어가게 하는 설정
