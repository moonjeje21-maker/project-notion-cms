# Living Wishlist 개발 로드맵

사고 싶은 인테리어 소품을 Notion 표에 "이름 + 상품 링크"만 적으면 웹 한 화면에 카드로 모아 보여 줘서, 흩어진 후보를 한곳에서 훑어보고 구매를 결정할 수 있게 한다.

작성일: 2026-10-10 · 갱신일: 2026-10-25 (Task 009 추가) · 기준 PRD: `docs/prd/prd.md` · 접근법: 구조 우선 (구조 → UI → 데이터)

## 📌 가정

- **파일 자리**: PRD는 `Item` 타입과 Notion 연동 코드의 폴더를 정하지 않았다. `CLAUDE.md` 계층 규칙에 따라 데이터·도우미는 `src/lib/`에 둔다 — 타입 `src/lib/items.ts`, 더미 데이터 `src/lib/mock-items.ts`, Notion 연동(열 이름 ↔ `Item` 매핑 포함) `src/lib/notion.ts`. 화면 부품은 `src/components/features/wishlist/`에 둔다 (`item-card.tsx`, `item-grid.tsx`, `category-chips.tsx`, `wishlist-view.tsx`)
- **Notion 열 타입**: "상품 링크"·"이미지 URL" 열은 Notion **URL 속성**으로 가정한다. 실제 타입이 다르면(예: 텍스트) `src/lib/notion.ts`의 매핑만 고친다 — Task 002에서 실제 열 확인: `이름`=title, `상품 링크`=url, `종류`=select, `이미지 URL`=url (가정 맞음)
- **"기타" 처리 시점**: `Item.category`는 비어 있지 않게 유지한다. Notion "종류"가 비어 있으면 매핑 단계(`src/lib/notion.ts`)에서 `"기타"`로 바꿔 넣고, 화면은 `category` 값을 그대로 배지와 칩에 쓴다. 더미 데이터에도 `"기타"` 소품을 하나 넣어 화면 Phase에서 미리 확인한다
- **더미 데이터의 수명**: 더미 데이터 `src/lib/mock-items.ts`는 Phase 2(화면) 확인용이며, Notion 연결(Task 006)에서 실제 데이터로 바꾼 뒤 삭제한다 — Task 006에서 삭제 완료
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

## 현재 상태

MVP 전체 완료(Task 000~008). 배포 주소는 `https://project-notion-cms.vercel.app`이다. 남은 것은 아래 "제외 (MVP 이후)" 절과 보류 중인 작은 수정 3건이다.

### 보류 중인 작은 수정

→ Task 009로 진행(Phase 5)

- 카드 `item-card.tsx`: `<img alt>`와 이름 `<p>`가 중복되어 스크린리더가 이름을 두 번 읽음
- `category-chips.tsx`: `overflow-x-auto` 때문에 칩 포커스 링이 잘릴 수 있음 (미확인)
- `toSafeUrl`(`src/lib/notion.ts`): `HTTPS://` 같은 대소문자와 앞뒤 공백을 허용

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
- Task 001 산출물: `src/lib/items.ts`(`Item` 타입, `OTHER_CATEGORY`) · `src/lib/mock-items.ts`(Phase 2 확인용 더미 9개, Task 006에서 삭제) · `src/components/features/wishlist/wishlist-view.tsx`(`items: Item[]` prop, Task 003부터 여기에 그리드를 넣음)
- Task 002 산출물: `src/lib/notion.ts`의 `fetchAllRows()` — `collectPaginatedAPI`로 전체 행을 최근 추가 순으로 모아 `PageObjectResponse[]`를 돌려줌(`isFullPage` 필터 적용). 환경변수 누락 시 한국어 오류. `.env.local`에 값 입력 완료, README에 "환경변수" 절 있음
- Task 003 산출물: `src/components/features/wishlist/item-card.tsx`(`ItemCard`: 테두리 없는 둥근 이미지(`rounded-2xl`) + 아래 이름·`Badge`, `Card` 부품 미사용, `"use client"` 없음) · `item-grid.tsx`(`ItemGrid`: `ul.grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4`) — 이후 Task 004가 `ItemCard`에 예외 상태를, Task 005가 `wishlist-view.tsx`에 칩·빈 상태를 더했음(`item-card.tsx`의 `"use client"` 없음은 Task 004에서 바뀜)
- Task 005 산출물: `src/components/features/wishlist/category-chips.tsx`(`CategoryChips`·`ALL_CATEGORY = "전체"`, `"use client"`) · `wishlist-view.tsx`가 칩·필터·빈 상태 2종(shadcn `Empty`)을 담당
- Task 004 산출물: `item-card.tsx`(`ItemCard`, `"use client"` + `useState`)가 카드의 예외 상태 전부를 처리 — 대체 그림(`imageUrl` 빈 문자열 또는 `onError` → `bg-muted` + `ImageOff`, `<img>` 미렌더), 링크 분기(`<a target="_blank" rel="noopener noreferrer" className="group …">` / `<div>`), 링크 없는 카드 배지 `opacity-60`, "기타" 배지는 `item.category` 그대로. hydration 전에 이미 실패한 이미지를 잡는 ref 콜백 `markIfAlreadyFailed`(`complete && naturalWidth === 0`) 보완 포함. Task 006은 데이터만 바꿨고 카드는 손대지 않았음
- Task 006 산출물: `src/lib/notion.ts`의 `getItems(): Promise<Item[]>`(`fetchAllRows()` → `toItem` 매핑, try/catch 없이 오류를 위로) · `toSafeUrl(value: string | null)`(export, `http(s)://`로 시작하지 않는 값 → `""`) · `COLUMN` 상수(Notion 열 이름은 여기만) · 속성 읽기 도우미 `readTitle`·`readUrl`·`readSelect`(열 없음·타입 다름 → `""`, 종류 비면 `OTHER_CATEGORY`). `page.tsx`는 `async` + `await getItems()`. 더미 데이터 `mock-items.ts`는 삭제됨 — 이후 Task는 실제 Notion 데이터로 확인한다
- Task 007 산출물: 코드 없음. `README.md` "환경변수" 절의 안내 2문단(build가 Notion을 읽어 `.env.local`·네트워크 필요 / 자동 갱신 확인은 `npm run build && npm run start`)과 확인 방법 — 연결 오류 재현은 `.env.local`을 고치지 않고 명령 앞 환경변수(`NOTION_API_KEY=wrong-key npm run dev -- -p 3001`, `NOTION_DATA_SOURCE_ID= …`)로 임시 서버를 띄워서 하고(이미 설정된 `process.env`를 `.env.local`이 덮지 않음), ISR 확인은 `next start`에서 응답 헤더 `x-nextjs-cache`(`HIT`/`STALE`)로 한다
- Task 008 산출물: 코드 없음. 배포 주소 `https://project-notion-cms.vercel.app`(`main` 병합 시 자동 재배포), 환경변수는 코드가 아니라 Vercel 설정(Settings → Environment Variables)에 등록, `README.md` "배포" 절에 안내. 확인 방법은 배포 주소 응답 헤더 `x-vercel-cache`(`HIT`/`STALE`)로 ISR을 본다

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

### Phase 3: Notion 연결 (데이터) ✅

- **Task 006: Notion 소품을 Item으로 바꿔 화면에 연결하기** ✅ - 완료
  - 담당 기능: F001, F010, F011
  - See: `docs/roadmap/tasks/006-notion-items-mapping.md`
  - ✅ `src/lib/notion.ts` 2차: 맨 위 설명 주석 "Notion 연결과 소품 표 읽기. 열 이름 ↔ Item 매핑은 이 파일에만 둔다". `COLUMN = { name: "이름", url: "상품 링크", category: "종류", imageUrl: "이미지 URL" } as const` — Notion 열 이름은 이 상수 하나에만 적고, 열 이름이 바뀌면 여기만 고친다. import는 코드베이스 관례대로 `@/lib/items`(`OTHER_CATEGORY`, `type Item`)
  - ✅ `export function toSafeUrl(value: string | null): string`(Task 004 code-reviewer 메모 반영): `null`·빈 값 → `""`, `http://`·`https://`로 **시작하지 않는** 값 → `""`, 그 외 그대로. `상품 링크`·`이미지 URL` 둘 다 거쳐 `<a href>`·`<img src>`에 `javascript:` 같은 값이 들어가지 않게 막음. `new URL()` 파싱 없음
  - ✅ 속성 읽기 도우미 `readTitle`·`readUrl`·`readSelect`(각 `(row: PageObjectResponse, name: string) => string`): `row.properties[name]`을 꺼내 `prop?.type` 비교로 좁힘(`any`·타입 단언 없음). 열이 없거나 타입이 다르면 `""`을 돌려주고 **오류를 던지지 않음**. 제목은 `plain_text` 이어 붙임, URL은 `toSafeUrl(prop.url)`, 선택은 `prop.select?.name ?? ""` → 비면 `OTHER_CATEGORY`(매핑 단계 한 곳에서만 "기타" 처리)
  - ✅ `toItem(row): Item`(export 안 함, `row.id` → `Item.id`) · `export async function getItems(): Promise<Item[]>` — `fetchAllRows()` → `map(toItem)`. 정렬 없음(이미 `created_time` 내림차순), try/catch 없음(환경변수 누락·API 실패는 그대로 위로 던져 `app/error.tsx`가 받음, F011). `fetchAllRows()` 위 주석을 "매핑은 getItems()가 한다"로 현행화
  - ✅ `src/app/(marketing)/page.tsx`: `mockItems` import 삭제, `import { getItems } from "@/lib/notion"`, `export default async function Home()` + `const items = await getItems()` + `<WishlistView items={items} />`. `export const revalidate = 300` 유지(F010), 주석 현행화. try/catch·`"use client"`·`dynamic` 없음
  - ✅ `src/lib/mock-items.ts` 삭제(`rm`), `grep -rn "mock-items\|mockItems" src/` 0건. `README.md` 3행 "Notion 연동은 아직 없습니다" → "Notion 데이터 소스에서 소품을 읽어 보여 줍니다"(Task 007 몫을 미리 처리), 폴더 그림의 `mock-items.ts` 줄 삭제. 변경 파일은 `notion.ts`(M)·`page.tsx`(M)·`mock-items.ts`(D)·`README.md`(M) 4개뿐 — `src/components/`·`items.ts`·`error.tsx` 변경 없음
  - ✅ 완료 기준 확인: `npm run lint` 통과(경고 0), `npm run build` 통과(빌드 로그 `- Environments: .env.local`, Notion 오류 없음, 라우트 표 `○ /` Revalidate 5m 유지 — `async` 페이지로 바꿔도 ISR 유지), `npm run check-all` 통과. 터미널 `getItems()` → 7행, 첫 항목 5개 필드 모두 `string`, 종류 목록 `소파·소파·라운지체어·그릇·라운지체어·소파·수납`(빈 값 0) · `toSafeUrl` → `["https://a.com","http://a.com","","","",""]` 기대값 일치(환경변수 없이 실행). 브라우저(headless Chrome + playwright-core 스크립트, dev 서버, 2026-10-25): 실제 소품 7장이 Notion 생성 시각 내림차순, 이름·종류 배지 일치, 칩 `전체 · 소파 · 라운지체어 · 그릇 · 수납`(등장 순서, "기타" 없음), "소파" 클릭 → 3장·주소 불변, 7장 모두 `<a target="_blank" rel="noopener noreferrer">`, 첫 카드 클릭 → 새 탭에 상품 주소, 375px 2열·칩 한 줄, React 콘솔 오류 0건. naver 상품 페이지 주소 4건은 `net::ERR_BLOCKED_BY_ORB`로 Task 004 대체 그림이 나옴(데이터 입력 문제, 코드 정상). 스크린샷 `.playwright-mcp/task-006-desktop.png`·`task-006-mobile.png`
  - ✅ 생략·방법 메모: 예외 행(이미지·링크·종류 빈 행) 브라우저 확인은 Notion 7행이 모두 채워져 있고 **사용자 결정(2026-10-25)으로 테스트 행을 추가하지 않아 생략**(`task-006-exceptions.png` 없음, `toSafeUrl` 터미널 확인과 Task 004·005 더미 검증으로 대체). 작업 파일의 `node … import('./src/lib/notion.ts')` 터미널 명령은 Node ESM이 `@/` 별칭도 확장자 없는 상대 경로도 못 풀어 그대로는 실패하므로, 프로젝트 밖 스크래치패드의 `node:module.registerHooks` resolve 훅을 `node --import`로 끼워 수행했고 프로젝트 파일(`tsconfig.json` 포함)은 바꾸지 않음. 앞으로의 끝-대-끝 확인은 브라우저와 `npm run build`로 한다
  - 미확인 메모(Task 005 리뷰, Task 004 범위 밖): `category-chips.tsx`의 `overflow-x-auto` 때문에 칩의 키보드 포커스 링이 위아래로 잘릴 수 있다는 추정이 아직 확인되지 않았다. 눈에 띄면 별도의 작은 수정(예: 칩 바깥 `div`에 `py-1`)으로 처리한다. 또한 Task 004 리뷰 메모 "링크 안에서 `<img alt>`와 이름 `<p>`가 중복되어 스크린리더가 이름을 두 번 읽음"도 카드 쪽 별도 작은 수정으로 남아 있다

- **Task 007: 자동 갱신과 연결 오류 화면 확인하기** ✅ - 완료
  - 담당 기능: F010, F011
  - See: `docs/roadmap/tasks/007-isr-and-error-screen-check.md`
  - ✅ 확인 Task — 코드 변경은 `README.md` 2문단뿐("환경변수" 절 끝, "배포할 때는 Vercel …" 문장 앞): (1) `npm run build`도 빌드 중 Notion을 읽어 `/`를 미리 만들므로 `.env.local`과 네트워크가 없으면 빌드가 실패한다 (2) Notion에서 고친 내용은 약 5분 뒤 반영되며, 개발 서버는 캐시가 돌지 않아 자동 갱신 확인은 `npm run build && npm run start`로 한다. 3행 첫 문단은 Task 006에서 이미 고쳐져 변경 없음. `src/lib/notion.ts`의 `requireEnv` 메시지는 변수 이름·원인·고칠 위치가 모두 있어 **변경 없음**. `error.tsx`·`page.tsx`·`src/components/`·`items.ts` 변경 없음, 오류 전용 페이지 신설 없음(PRD 가정)
  - ✅ 연결 실패 (a) 잘못된 키(F011): `.env.local`을 고치지 않고 명령 앞 환경변수 `NOTION_API_KEY=wrong-key npm run dev -- -p 3001`로 3001 임시 서버를 띄움(Next.js는 이미 설정된 `process.env`를 `.env.local`로 덮지 않음 — `@next/env` 로더로 사전 검증, 폴백 불필요). headless Chrome으로 `/` 열기 → `app/error.tsx`의 "문제가 생겼습니다" + "잠시 후 다시 시도해 주세요…" + "다시 시도" 버튼 각 1개, 카드 0장. "다시 시도" 클릭 → `/` 요청 1건 추가 발생, 오류 화면 재렌더, 서버 로그에 `APIResponseError: API token is invalid. (401 unauthorized)` 2회(첫 로드 + retry) → `retry`가 다시 불러오는 것 확인. dev 오버레이 "2 Issues"는 정상. 스크린샷 `.playwright-mcp/task-007-error.png`
  - ✅ 연결 실패 (b) 환경변수 누락(F011): `NOTION_DATA_SOURCE_ID= npm run dev -- -p 3001`(빈 문자열도 "이미 설정됨"으로 취급돼 `.env.local`이 채우지 않음) → `/` 요청 HTTP 500, 서버 로그에 한국어 메시지 `환경변수 NOTION_DATA_SOURCE_ID가 없습니다. .env.local을 확인하세요` 1회 — 문구 그대로 유지
  - ✅ 정상 복귀: 임시 서버 종료 후 `npm run start`(3000, build 결과)에서 `/` 200, `x-nextjs-cache: HIT`, 카드 7장, 첫 카드 "홈앤힐 포비 …". 스크린샷 `.playwright-mcp/task-007-isr-before.png`(첫 방문 12:49:50Z, build 12:48:01Z)
  - ✅ 자동 갱신(F010) 1차: 사용자가 Notion 첫 소품 이름 끝에 " ✔" 추가 → 첫 방문 뒤 487초(12:57:58Z) 요청에서 이미 `HIT` + ✔ 반영. 반영 자체는 확인됐으나 "5분 안 불변"·"첫 요청 STALE"은 관찰 못 함(응답이 5분 창 이후에 왔고 그 사이 다른 방문으로 재생성이 끝나 있었던 것으로 **추정**). 스크린샷 `.playwright-mcp/task-007-isr-after.png`(✔ 보임)
  - ✅ 자동 갱신(F010) 2차(원복을 두 번째 변경으로 활용): 재생성 12:57:58Z 기준 283초 뒤(13:02:41Z) 요청 → `HIT` + ✔ 그대로(**5분 안 불변 = 캐시 동작**). 310초 뒤(13:03:08Z) 요청 1 → `STALE` + ✔ 그대로(이전 페이지 제공, 뒤에서 재생성), 3초 뒤 요청 2 → `HIT` + ✔ 없음(**새 페이지 반영**). Next.js 문서의 "새로 고침 두 번" 동작과 일치. 메모: `next start`의 재생성 결과는 메모리에만 있고 `.next/server/app/index.html`(12:48:02Z)은 바뀌지 않음
  - ✅ 완료 기준 확인: `npm run check-all` 통과(lint 경고 0, typegen 성공, tsc 오류 0), `npm run build` 통과(`- Environments: .env.local`, Notion 오류 없음, 라우트 표 `○ /  5m  1y`, `○ /_not-found`). 원복: Notion 이름 되돌림(요청 2 결과로 확인), `.env.local` 미수정, 3000·3001 임시 서버 모두 종료(`lsof` 비어 있음). 변경 파일 `README.md`(+4행)뿐. 남긴 일 없음 — 별도 작은 수정 3건(카드 `alt` 중복, 칩 포커스 링, `toSafeUrl` 대소문자·공백)은 그대로 보류

### Phase 4: 배포 ✅

- **Task 008: Vercel에 배포하고 환경변수 등록하기** ✅ - 완료
  - 담당 기능: F010, F011
  - See: `docs/roadmap/tasks/008-vercel-deploy.md`
  - ✅ 사용자가 Vercel 대시보드에서 GitHub 저장소 `project-notion-cms`를 Import → Deploy 전에 환경변수 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID` 등록(F011 명세) → Deploy 성공. 프로덕션 주소 `https://project-notion-cms.vercel.app` (`main`에 병합하면 자동 재배포). Vercel CLI는 설치하지 않았음
  - ✅ 배포본 확인(headless Chrome, 2026-10-25): 카드 7장·종류 칩·칩 필터·카드 새 탭·375px 2열·콘솔 오류 0건. 네이버 상품 주소 4건은 대체 그림(데이터 문제, 코드 정상). 스크린샷 `.playwright-mcp/task-008-prod-*.png`
  - ✅ F010 배포본 확인: Notion 수정 직후 요청 `x-vercel-cache: HIT`(age 125, 내용 불변) → 310초 뒤 요청 1 `STALE`(age 310, 이전 페이지) → 요청 2 `HIT`(age 2, 수정 반영)
  - ✅ 코드 변경은 `README.md` "배포" 절뿐. 로컬 `npm run build`·`npm run check-all` 통과. 계획 파일 없음(README만 바뀌고 사용자 단계가 먼저라 plan 모드 생략, 작업 파일이 계획 역할)

### Phase 5: 다듬기

- **Task 009: 보류 중인 작은 수정 3건 처리하기** - 우선순위
  - 담당 기능: F002, F004, F003 (기존 기능 다듬기, 새 기능 ID 없음)
  - See: `docs/roadmap/tasks/009-small-fixes.md`
  - `src/components/features/wishlist/item-card.tsx`: 링크 안에서 `<img alt={item.name}>`과 이름 `<p>`가 겹쳐 스크린리더가 이름을 두 번 읽음 → `alt=""`로 바꿔 이미지를 장식 처리(이름은 `<p>`가 전달)
  - `src/components/features/wishlist/category-chips.tsx`: `overflow-x-auto` 때문에 칩 포커스 링(3px)이 위아래로 잘릴 수 있음(미확인) → 먼저 Tab 키로 확인하고, 잘리면 바깥 `div`에 `py-1 -my-1`, 안 잘리면 코드 변경 없이 결과만 기록
  - `src/lib/notion.ts`의 `toSafeUrl`: `HTTPS://`·앞뒤 공백 주소가 `""`가 되어 링크가 조용히 사라짐 → `trim()` 뒤 `/^https?:\/\//i`로 검사
  - 완료 기준: lint·build 통과(`/` Revalidate 5m 유지), `img alt=""`·링크 접근성 이름에 소품 이름 1회, 포커스 링 확인 결과 기록, `toSafeUrl` 기대값 일치, 카드·칩 화면 회귀 없음

## 기능 ↔ Task 대조표

| 기능 ID | 기능명 | Task |
|---|---|---|
| F001 | 소품 목록 카드 그리드 | Task 003, Task 006 |
| F002 | 구매 링크 새 탭 열기 | Task 004 |
| F003 | 종류 칩 필터 | Task 005 |
| F004 | 빈 상태·대체 이미지 표시 | Task 004, Task 005 |
| F010 | Notion 자동 갱신 | Task 001, Task 006, Task 007, Task 008 |
| F011 | Notion 연결 오류 표시 | Task 002, Task 006, Task 007, Task 008 |

기반 Task(기능 ID 없음): Task 000(스타터 정리), Task 001(타입·더미 데이터·부품 자리, F010의 `revalidate` 자리 포함), Task 002(SDK 설치·환경변수·연결 준비, F011의 환경변수 오류 포함), Task 009(기존 기능 F002·F003·F004 다듬기, 새 ID 없음)

## 제외 (MVP 이후)

- 소품 상세 페이지 (가격·크기가 생기면 그때)
- 가격·크기 표시와 비교, 상품 링크에서 가격·이미지 자동 수집 (2026-10-25 QA에서 재확인: 서버 fetch로 `og:image` 추출 가능, 네이버는 headless 브라우저를 429로 막음. MVP 제외 유지)
- 정렬 선택 (최신순 외 가격순 등)
- 필터 값을 주소에 담아 공유 (주소 쿼리 필터)
- 공간별(거실·침실 등) 필터, 이름 검색
- 비교 화면 (여러 소품 나란히 보기)
- 로그인, 웹에서 직접 입력 (입력은 Notion에서만)
- Notion Web Clipper로 저장 시 이 데이터베이스로 들어가게 하는 설정
