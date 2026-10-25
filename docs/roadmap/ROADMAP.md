# Living Wishlist 개발 로드맵

사고 싶은 인테리어 소품을 Notion 표에 "이름 + 상품 링크"만 적으면 웹 한 화면에 카드로 모아 보여 줘서, 흩어진 후보를 한곳에서 훑어보고 구매를 결정할 수 있게 한다.

작성일: 2026-10-10 · 갱신일: 2026-10-25 (Task 004 완료·Phase 2 완료, PR #22 자동 검사 hook 워크플로우 반영) · 기준 PRD: `docs/prd/prd.md` · 접근법: 구조 우선 (구조 → UI → 데이터)

## 📌 가정

- **파일 자리**: PRD는 `Item` 타입과 Notion 연동 코드의 폴더를 정하지 않았다. `CLAUDE.md` 계층 규칙에 따라 데이터·도우미는 `src/lib/`에 둔다 — 타입 `src/lib/items.ts`, 더미 데이터 `src/lib/mock-items.ts`, Notion 연동(열 이름 ↔ `Item` 매핑 포함) `src/lib/notion.ts`. 화면 부품은 `src/components/features/wishlist/`에 둔다 (`item-card.tsx`, `item-grid.tsx`, `category-chips.tsx`, `wishlist-view.tsx`)
- **Notion 열 타입**: "상품 링크"·"이미지 URL" 열은 Notion **URL 속성**으로 가정한다. 실제 타입이 다르면(예: 텍스트) `src/lib/notion.ts`의 매핑만 고친다 — Task 002에서 실제 열 확인: `이름`=title, `상품 링크`=url, `종류`=select, `이미지 URL`=url (가정 맞음)
- **"기타" 처리 시점**: `Item.category`는 비어 있지 않게 유지한다. Notion "종류"가 비어 있으면 매핑 단계(`src/lib/notion.ts`)에서 `"기타"`로 바꿔 넣고, 화면은 `category` 값을 그대로 배지와 칩에 쓴다. 더미 데이터에도 `"기타"` 소품을 하나 넣어 화면 Phase에서 미리 확인한다
- **더미 데이터의 수명**: 더미 데이터 `src/lib/mock-items.ts`는 Phase 2(화면) 확인용이며, Notion 연결(Task 006)에서 실제 데이터로 바꾼 뒤 삭제한다
- **클라이언트 경계**: 이미지 깨짐 감지(`onError`)와 칩 선택 상태는 브라우저에서만 동작하므로 `item-card.tsx`·`category-chips.tsx`·`wishlist-view.tsx`에 `"use client"`를 붙인다. 소품 목록 페이지(`page.tsx`)는 서버 컴포넌트로 남겨 Notion을 읽고 `items`를 props로 넘긴다
- **페이지 머리 영역**: 현재 `page.tsx`의 `PageHeader`는 그대로 두고, 자리 표시 문구만 사이트 설명(`siteConfig.description`)으로 바꾼다. 머리글의 사이트 이름·다크 모드 버튼은 PRD 가정대로 손대지 않는다
- **빌드 시 Notion 접근**: Task 006부터 `npm run build`가 빌드 중 Notion을 읽어 `/`를 미리 만들므로, `.env.local`과 네트워크가 있어야 build가 통과한다. 환경변수가 없으면 `src/lib/notion.ts`가 한국어 메시지로 바로 오류를 던지게 해 원인을 알 수 있게 한다
- **Notion 연결 검증 시점**: 가장 불확실한 외부 연동(열 타입·데이터 소스 ID·SDK 5.x 호출 방식)을 화면보다 먼저 확인하기 위해 SDK 설치·환경변수·원시 조회(Task 002)를 Phase 1에 둔다. 화면 Task는 더미 데이터를 그대로 쓰고, 실제 데이터 연결은 Task 006에서 한다
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
4. **확인**: `npm run check-all`(lint + typegen + tsc) → `npm run build` → 브라우저 확인(스크린샷은 `.playwright-mcp/`). Notion 자동 갱신은 `npm run build && npm run start`. 2026-10-25(PR #22)부터 턴이 끝날 때 Stop hook(`.claude/hooks/check-after-work.sh`)이 `src/`·설정 파일에 커밋 안 된 변경이 있으면 이 두 명령을 자동으로 돌리고, Edit/Write로 `src/`의 `.ts`·`.tsx`를 고치면 그 파일만 바로 eslint로 검사한다(`lint-changed-file.sh`). 브라우저 도구(Claude in Chrome·Playwright MCP)가 세션에 없으면 Task 004처럼 npx 캐시의 `playwright-core` + 설치된 Chrome(headless) 스크립트로 대신 확인한다
5. **마무리**: 작업 파일에 변경 요약을 적고, `development-planner`에게 "Task XXX 완료로 바꿔줘" → ROADMAP 갱신. 커밋은 `/ship` (`src/`가 바뀐 PR은 `code-reviewer` 에이전트의 "승인"을 먼저 받고, 계획 파일의 진행 상태를 같은 PR에 넣는다)

## 활용하는 기존 코드 (다시 만들지 않음)

- 화면 틀 `src/app/(marketing)/layout.tsx` (`<main>` 포함, 머리글 `site-header` + 바닥글 `site-footer` + 휴대폰 서랍 `mobile-nav`)
- 공용 오류 화면 `src/app/error.tsx` (`retry` prop, "다시 시도" 버튼, 한국어 문구) · 404 `src/app/not-found.tsx`
- `src/components/common/page-header.tsx` (페이지 제목 + 설명) · `logo.tsx` · `theme-toggle.tsx`
- shadcn 부품 `src/components/ui/`: `badge`(종류 배지), `button`(칩), `card`(설치돼 있으나 소품 카드에는 쓰지 않음), `empty`(빈 상태) · 아이콘 `lucide-react`
- `src/lib/site.ts` (사이트 이름·메뉴, 이미 Living Wishlist 값) · `src/lib/utils.ts`의 `cn()`
- `.gitignore`의 `.env*` 규칙 (`.env.local`이 git에 올라가지 않음)
- Task 001 산출물: `src/lib/items.ts`(`Item` 타입, `OTHER_CATEGORY`) · `src/lib/mock-items.ts`(Phase 2 확인용 더미 9개) · `src/components/features/wishlist/wishlist-view.tsx`(`items: Item[]` prop, Task 003부터 여기에 그리드를 넣음)
- Task 002 산출물: `src/lib/notion.ts`의 `fetchAllRows()` — `collectPaginatedAPI`로 전체 행을 최근 추가 순으로 모아 `PageObjectResponse[]`를 돌려줌(`isFullPage` 필터 적용). 환경변수 누락 시 한국어 오류. `.env.local`에 값 입력 완료, README에 "환경변수" 절 있음
- Task 003 산출물: `src/components/features/wishlist/item-card.tsx`(`ItemCard`: 테두리 없는 둥근 이미지(`rounded-2xl`) + 아래 이름·`Badge`, `Card` 부품 미사용, `"use client"` 없음) · `item-grid.tsx`(`ItemGrid`: `ul.grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4`) — 이후 Task 004가 `ItemCard`에 예외 상태를, Task 005가 `wishlist-view.tsx`에 칩·빈 상태를 더했음(`item-card.tsx`의 `"use client"` 없음은 Task 004에서 바뀜)
- Task 005 산출물: `src/components/features/wishlist/category-chips.tsx`(`CategoryChips`·`ALL_CATEGORY = "전체"`, `"use client"`) · `wishlist-view.tsx`가 칩·필터·빈 상태 2종(shadcn `Empty`)을 담당
- Task 004 산출물: `item-card.tsx`(`ItemCard`, `"use client"` + `useState`)가 카드의 예외 상태 전부를 처리 — 대체 그림(`imageUrl` 빈 문자열 또는 `onError` → `bg-muted` + `ImageOff`, `<img>` 미렌더), 링크 분기(`<a target="_blank" rel="noopener noreferrer" className="group …">` / `<div>`), 링크 없는 카드 배지 `opacity-60`, "기타" 배지는 `item.category` 그대로. hydration 전에 이미 실패한 이미지를 잡는 ref 콜백 `markIfAlreadyFailed`(`complete && naturalWidth === 0`) 보완 포함. Task 006은 데이터만 바꾸면 되고 카드는 손대지 않음

## 개발 단계

### Phase 0: 준비 ✅

- **Task 000: 스타터 킷 예제 정리** ✅ - 완료
  - 담당 기능: 기반 (전 기능 공통)
  - See: `plans/2026-10-10-project-notion-cms-starter-cleanup-plan.md`
  - ✅ `(dashboard)` 경로, 사이드바·대시보드 틀 조각, `features/home/` 데모, `lib/stack.ts`, `hooks/use-mobile.ts`, 미사용 shadcn 부품 21개 삭제, `npm uninstall sonner`
  - ✅ `lib/site.ts`를 Living Wishlist 값으로(`mainNav` "홈" 하나, `footerNav` 빈 배열), `(marketing)/page.tsx`는 `PageHeader` 자리 표시 문구만, `app/layout.tsx`에서 Toaster·TooltipProvider 제거, `next.config.ts` 비움
  - ✅ `README.md`·`CLAUDE.md`·`.claude/rules/`·PRD의 낡은 문장 수정. `npm run lint`·`npm run build` 통과 (라우트 `/`·`/_not-found`)

### Phase 1: 뼈대 (구조) ✅

- **Task 001: Item 타입·더미 데이터·화면 부품 자리 만들기** ✅ - 완료
  - 담당 기능: 기반 (전 기능 공통), F010
  - See: `docs/roadmap/tasks/001-item-type-and-dummy-data.md`
  - ✅ `src/lib/items.ts`: PRD 데이터 모델의 `Item` 타입(`id`·`name`·`url`·`imageUrl`·`category`, 모두 `string`, 없는 값은 빈 문자열, `category`는 비면 `"기타"`)과 상수 `OTHER_CATEGORY = "기타"`
  - ✅ `src/lib/mock-items.ts`: `Item[]` 더미 소품 8~10개. 종류 가구·조명·화분·수납·러그·소품을 섞고, 이미지 URL 없는 것·깨진 주소인 것·상품 링크 없는 것·종류 없는(`"기타"`) 것을 각 1개 이상 포함해 Phase 2에서 모든 화면 상태를 눌러 볼 수 있게 한다. 순서는 "최근 추가가 위"로 가정한 배열 순서
  - ✅ `src/components/features/wishlist/` 폴더와 `wishlist-view.tsx` 자리: `items: Item[]` prop을 받아 소품 개수만 한국어로 보여 주는 최소 컴포넌트(named export, 아직 `"use client"` 없음)
  - ✅ `src/app/(marketing)/page.tsx`: `export const revalidate = 300` 추가(F010 자리, `cacheComponents`는 켜지 않음), `mockItems`를 `WishlistView`에 넘김, `PageHeader` 설명을 `siteConfig.description`으로 교체
  - 완료 기준: lint·build 통과, 브라우저에서 `/`에 사이트 제목·설명과 "소품 N개" 문구가 보임, build 출력에서 `/`가 `revalidate` 300초(ISR)로 표시됨

- **Task 002: Notion SDK 설치와 연결 준비하기** ✅ - 완료
  - 담당 기능: 기반 (전 기능 공통), F011
  - See: `docs/roadmap/tasks/002-notion-sdk-and-connection-prep.md`
  - ✅ `.claude/rules/dependencies.md`·`.claude/rules/library-docs.md`를 먼저 읽고 `@notionhq/client` **5.x** 설치(`npm view @notionhq/client version`으로 현재 버전 확인, 설치 후 `node_modules/@notionhq/client`의 `*.d.ts`로 `dataSources.query`와 전체 행 수집 도우미 이름(`collectPaginatedAPI` 등) 확인). `README.md` 기술 스택 표에 버전 추가
  - ✅ `.env.local`에 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID` (데이터 소스 ID. 데이터베이스 ID와 섞지 않음, `.gitignore`의 `.env*`로 미추적 확인). `README.md`에 두 변수 이름과 얻는 방법("데이터 소스 관리 → 데이터 소스 ID 복사") 한 절 추가
  - ✅ `src/lib/notion.ts` 1차: Notion 클라이언트 생성, 환경변수가 없으면 한국어 메시지로 오류를 던진다(F011의 원인 노출). `fetchAllRows()` — `dataSources.query`에 데이터 소스 ID, 정렬 `created_time` 내림차순(최근 추가가 위), 100개 넘어도 전부 가져오도록 전체 행 수집(`next_cursor` 반복 또는 SDK 도우미). **열 이름 ↔ `Item` 매핑은 아직 넣지 않고** SDK 응답 행을 그대로 반환한다. `any` 금지
  - ✅ `src/app/(marketing)/page.tsx`는 건드리지 않는다 (화면 연결은 Task 006)
  - 완료 기준: lint·build 통과, 터미널에서 행 개수 확인 — `node --env-file=.env.local --input-type=module -e "import('./src/lib/notion.ts').then(m => m.fetchAllRows()).then(r => console.log(r.length))"` (Node 24는 TS 파일을 바로 실행. 안 되면 `page.tsx`에 임시 `console.log`를 넣어 보고 제거). 환경변수 하나를 지우면 한국어 오류 메시지가 찍힘

### Phase 2: 화면 (UI, 더미 데이터) ✅

- **Task 003: 기본 소품 카드와 카드 그리드 만들기** ✅ - 완료
  - 담당 기능: F001
  - See: `docs/roadmap/tasks/003-item-card-and-grid.md`
  - ✅ `src/components/features/wishlist/item-card.tsx`: `ItemCard` — shadcn `Card` 부품을 쓰지 않는 일반 `div`. 테두리·배경 없는 둥근 이미지 영역(`div.aspect-square.rounded-2xl.bg-muted`) 안에 일반 `<img>`(`object-cover`, `loading="lazy"`, `alt`는 소품 이름, `next/image` 사용 안 함), 그 아래에 이름(`line-clamp-2 text-sm font-semibold`)과 `Badge variant="secondary"` 종류를 세로로 둠 (2026-10-11 참고 디자인 반영, `plans/2026-10-11-project-notion-cms-card-design-plan.md`). `@next/next/no-img-element`는 해당 줄 eslint 주석으로 처리(설정 파일은 손대지 않음). `"use client"` 없이 정상 데이터만 그림. 대체 그림·링크 처리는 Task 004
  - ✅ `src/components/features/wishlist/item-grid.tsx`: `ItemGrid` — `items: Item[]`를 받아 `ul.grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4`에 `li key={item.id}`로 `ItemCard` 나열(F001 반응형). 색은 토큰 클래스만, 문구는 한국어
  - ✅ `wishlist-view.tsx`에서 "소품 N개" 문구를 지우고 `ItemGrid`를 그림
  - ✅ 완료 기준 확인: lint·build 통과, build 라우트 표에서 `/` Revalidate 5m 유지. 브라우저에서 1280px 4열·375px 2열, 카드 9개에 이미지·이름·배지(mock-8 "기타") 확인. 스크린샷 `.playwright-mcp/task-003-desktop.png`·`task-003-mobile.png`. 디자인 다듬기 후 라이트·다크·375px 재확인, 스크린샷 `.playwright-mcp/task-003-design-desktop.png`·`task-003-design-mobile.png`

- **Task 004: 카드의 예외 상태 만들기** ✅ - 완료
  - 담당 기능: F002, F004
  - See: `docs/roadmap/tasks/004-item-card-exception-states.md`
  - ✅ Task 005가 먼저 완료된 뒤(2026-10-11 순서 변경) Phase 2의 마지막 Task로 진행. 변경 파일은 `src/components/features/wishlist/item-card.tsx` **하나**(`git diff --stat` 확인) — `wishlist-view.tsx`·`category-chips.tsx`·`item-grid.tsx`·`page.tsx`·`items.ts`·`mock-items.ts`·`src/components/ui/` 변경 없음, 더미 데이터 임시 변경도 없음
  - ✅ `item-card.tsx`에 `"use client"` + `useState`(`react`)·`ImageOff`(`lucide-react`) import. `const [failed, setFailed] = useState(false)`, `showFallback = item.imageUrl === "" || failed`, `hasLink = item.url !== ""`. 맨 위 주석을 현행 설명(대체 그림·새 탭 링크·링크 없는 카드 흐림·"기타" 배지)으로 교체
  - ✅ 대체 그림(F004): 이미지 영역 `div`(`aspect-square w-full overflow-hidden rounded-2xl bg-muted`)에 `flex items-center justify-center`를 더하고 `<ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />`만 가운데. `imageUrl`이 빈 문자열이면 `<img>`를 아예 그리지 않아 React 콘솔 오류("An empty string was passed to the src attribute")가 사라짐. 정상 `<img>`에는 `onError={() => setFailed(true)}`·`transition group-hover:opacity-90` 추가, `eslint-disable-next-line @next/next/no-img-element` 주석 유지
  - ✅ 링크 분기(F002): 안쪽 내용(이미지 영역 + 글자 영역)을 변수 `content`에 한 번만 적고, `hasLink`면 `<a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">{content}</a>`, 아니면 `<div className="flex flex-col gap-2">{content}</div>`(`Wrapper = "a" | "div"` 방식은 `href`·`target` prop 타입이 꼬여 피함). 링크 없는 카드만 `Badge variant="secondary" className="opacity-60"`(최종 결정, 스크린샷에서 충분히 구분됨), 링크 있는 카드는 `variant="secondary"` 그대로. `aria-label`(선택 사항)은 넣지 않음
  - ✅ "기타" 배지(F004): `<Badge>{item.category}</Badge>`를 그대로 두어 mock-8이 "기타"로 나옴. `OTHER_CATEGORY` 비교 분기 없음
  - ✅ **보완**(브라우저 확인에서 찾은 버그): mock-5의 깨진 이미지 요청이 약 80ms 만에 실패(`net::ERR_BLOCKED_BY_ORB`)해 React hydration보다 먼저 끝나면 `onError`가 울리지 않아 `<img>`가 그대로 남는 타이밍 버그가 반복 재현됨. `next/image`와 같은 방식으로 `<img>`에 ref 콜백 `markIfAlreadyFailed`를 달아 요소가 붙을 때 이미 깨져 있으면(`complete && naturalWidth === 0`) `setFailed(true)` 호출(`useEffect` 미사용). lazy 이미지는 요청 전이라 `complete`가 false여서 오탐 없음
  - ✅ 완료 기준 확인: `npm run lint` 통과(경고 0), `npm run build` 통과, build 라우트 표에서 `/` `○` Revalidate 5m 유지(카드가 클라이언트 컴포넌트가 돼도 `page.tsx`가 서버 컴포넌트라 ISR 유지), `npm run check-all`(lint + typegen + tsc) 통과. 브라우저(headless Chrome + playwright-core 스크립트, dev 서버, 2026-10-25): 1280px에서 mock-3·mock-5 모두 `<img>` 없이 `ImageOff` + `bg-muted` 정사각형(236×236px, 다른 카드와 동일), 정상 이미지 7장 로드, 콘솔 오류·경고 0건, mock-8 "기타" 배지. mock-1은 `<a target="_blank" rel="noopener noreferrer">`, hover 시 opacity 1 → 0.9·커서 `pointer`, 클릭 시 새 탭 `https://example.com/products/oak-side-table`이 열리고 원래 탭은 `http://localhost:3000/` 유지. mock-7은 `<div>`, 커서 `auto`, 배지 opacity 0.6, 클릭해도 변화 없음. 375px 다크 모드 2열에서 대체 그림 164×164px 정사각형, `bg-muted`와 아이콘 구분됨. 보완 후 mock-5를 데스크톱·모바일 각 3회 새로 고침으로 재현 확인(모두 대체 그림, 오탐 0). 스크린샷 `.playwright-mcp/task-004-desktop.png`·`task-004-hover.png`·`task-004-no-link.png`·`task-004-mobile.png`

- **Task 005: 종류 칩 필터와 빈 상태 만들기** ✅ - 완료
  - 담당 기능: F003, F004
  - See: `docs/roadmap/tasks/005-category-chips-and-empty-state.md`
  - ✅ `src/components/features/wishlist/category-chips.tsx` (새 파일, `"use client"`): 상수 `ALL_CATEGORY = "전체"`와 `CategoryChips` — `categories`·`selected`·`onSelect` prop. "전체" 칩이 맨 앞, 선택된 칩은 `Button size="sm"` `variant="default"`, 나머지는 `variant="outline"`, 칩은 `rounded-full shrink-0` + `aria-pressed`. 바깥은 `div.flex.gap-2.overflow-x-auto` `role="group"`(휴대폰에서 가로 스크롤 한 줄, 세로 줄바꿈 없음). 색 타일·개수 표시 없음 (2026-10-11 사용자 디자인 결정)
  - ✅ `wishlist-view.tsx`에 `"use client"`와 `useState(ALL_CATEGORY)`로 선택 종류 상태. 칩 목록은 `getCategories()`가 `items`의 `category`를 등장 순서대로 중복 제거하고 `"기타"`를 맨 끝으로 보냄(PRD 가정). 필터는 브라우저 안에서만 — `useSearchParams`·`router.push` 미사용, 주소(쿼리) 불변(F010 캐시 보호)
  - ✅ 빈 상태 2종을 shadcn `Empty`로: 소품 0개 → 칩 없이 "아직 소품이 없어요"(`PackageOpen` 아이콘); 필터 결과 0개 → 칩 유지 + "이 종류의 소품이 없어요"(`SearchX` 아이콘)
  - ✅ `item-grid.tsx`는 주석만 수정. 두 빈 상태는 더미 데이터를 임시로 바꿔 확인한 뒤 원복(코드로 남기지 않음)
  - ✅ 완료 기준 확인: lint·build 통과, build 라우트 표에서 `/` `○` Revalidate 5m 유지(주소 쿼리 미사용). 브라우저에서 칩 순서 전체·가구·조명·화분·수납·러그·소품·기타, 가구 2장·조명 2장·기타 1장 필터, 주소 불변, "전체" 클릭 시 전체 복귀, 375px 한 줄 가로 스크롤, 빈 상태 2종 확인. 스크린샷 `.playwright-mcp/task-005-*.png`

### Phase 3: Notion 연결 (데이터)

- **Task 006: Notion 소품을 Item으로 바꿔 화면에 연결하기** - 우선순위
  - 담당 기능: F001, F010, F011
  - `src/lib/notion.ts` 2차: `getItems(): Promise<Item[]>` — `fetchAllRows()` 결과를 열 이름 ↔ `Item` 매핑("이름" 제목 → `name`, "상품 링크" → `url`, "종류" Select → `category`(비면 `"기타"`), "이미지 URL" → `imageUrl`)으로 바꾼다. 매핑은 이 파일에만 둔다. `any` 금지 — SDK 응답 타입과 타입 가드로 속성을 읽는다
  - `fetchAllRows()`는 이미 `isFullPage`로 거른 `PageObjectResponse[]`를 돌려주므로, 매핑은 `row.properties["이름"]` 등을 Task 002에서 확인한 타입(`이름`=title, `상품 링크`=url, `종류`=select, `이미지 URL`=url)으로 읽는다. `row.id`가 `Item.id`, 정렬은 이미 최근 추가 순
  - `src/app/(marketing)/page.tsx`를 `async`로 바꿔 `await getItems()` 결과를 `WishlistView`에 넘긴다. 실패 시 오류를 잡지 않고 던져 `app/error.tsx`가 받게 한다(F011). `src/lib/mock-items.ts` 삭제
  - 완료 기준: lint·build 통과(`.env.local` 필요), 브라우저(`npm run dev`)에서 Notion의 실제 소품이 최근 추가 순으로 카드에 보이고 칩·링크·대체 이미지·"기타"가 실제 데이터로 동작
  - 미확인 메모(Task 005 리뷰, Task 004 범위 밖): `category-chips.tsx`의 `overflow-x-auto` 때문에 칩의 키보드 포커스 링이 위아래로 잘릴 수 있다는 추정이 아직 확인되지 않았다. 실제 데이터 확인 중 Tab 키로 칩을 지날 때 눈에 띄면 이 Task 커밋에 섞지 않고 별도의 작은 수정(예: 칩 바깥 `div`에 `py-1`)으로 처리한다

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
| F001 | 소품 목록 카드 그리드 | Task 003, Task 006 |
| F002 | 구매 링크 새 탭 열기 | Task 004 |
| F003 | 종류 칩 필터 | Task 005 |
| F004 | 빈 상태·대체 이미지 표시 | Task 004, Task 005 |
| F010 | Notion 자동 갱신 | Task 001, Task 006, Task 007, Task 008 |
| F011 | Notion 연결 오류 표시 | Task 002, Task 006, Task 007, Task 008 |

기반 Task(기능 ID 없음): Task 000(스타터 정리), Task 001(타입·더미 데이터·부품 자리, F010의 `revalidate` 자리 포함), Task 002(SDK 설치·환경변수·연결 준비, F011의 환경변수 오류 포함)

## 제외 (MVP 이후)

- 소품 상세 페이지 (가격·크기가 생기면 그때)
- 가격·크기 표시와 비교, 상품 링크에서 가격·이미지 자동 수집
- 정렬 선택 (최신순 외 가격순 등)
- 필터 값을 주소에 담아 공유 (주소 쿼리 필터)
- 공간별(거실·침실 등) 필터, 이름 검색
- 비교 화면 (여러 소품 나란히 보기)
- 로그인, 웹에서 직접 입력 (입력은 Notion에서만)
- Notion Web Clipper로 저장 시 이 데이터베이스로 들어가게 하는 설정
