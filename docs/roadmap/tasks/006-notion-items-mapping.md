# Task 006: Notion 소품을 Item으로 바꿔 화면에 연결하기

담당 기능: F001, F010, F011 · Phase 3 · 상태: 완료

> 맥락: Phase 2(Task 003·004·005)가 끝나 화면은 더미 데이터 `mockItems` 9개로 전부 동작한다 — 카드 그리드·칩 필터·빈 상태 2종·대체 그림·링크 분기·"기타" 배지. 이 Task는 **Phase 3의 첫 Task**로, 더미를 Notion 실제 데이터로 바꾼다. Task 002에서 만든 `fetchAllRows()`가 이미 Notion 행(`PageObjectResponse[]`)을 최근 추가 순으로 돌려주므로, 남은 일은 "행 → `Item` 매핑"과 "페이지가 그 결과를 쓰게 하기" 둘이다. 화면 부품(`wishlist-view.tsx`·`category-chips.tsx`·`item-card.tsx`·`item-grid.tsx`)과 타입(`items.ts`)·오류 화면(`error.tsx`)은 **건드리지 않는다**.

## 목표

`src/lib/notion.ts`에 `getItems(): Promise<Item[]>`를 추가해 Notion 표의 열(`이름`·`상품 링크`·`종류`·`이미지 URL`)을 화면용 `Item`(`id`·`name`·`url`·`imageUrl`·`category`)으로 바꾸고, `src/app/(marketing)/page.tsx`를 `async` 서버 컴포넌트로 바꿔 `await getItems()` 결과를 `WishlistView`에 넘긴다. 더미 데이터 `src/lib/mock-items.ts`는 삭제한다. 이 Task가 끝나면 `/`에 Notion에 적은 실제 소품이 최근 추가 순으로 카드로 보이고, 칩은 실제 종류 값에서 만들어지며, Notion 쪽 빈 값(이미지 없음·링크 없음·종류 없음)이 Task 004·005에서 만든 예외 처리로 그대로 나온다.

PRD 근거: F001 "Notion 데이터베이스의 소품 전체(이름·상품 링크·종류·이미지 URL)를 가져와 카드(이미지·이름·종류 배지)로 보여준다. 순서는 Notion 생성 시각 역순(최근 추가가 위)", F010 "소품 목록 페이지 파일에 `export const revalidate = 300`을 둔다"(Notion을 실제로 읽는 이 Task부터 ISR이 의미를 갖는다), F011 "Notion 읽기에 실패하면 … 공용 오류 화면('다시 시도' 버튼)을 보여주고, 버튼을 누르면 `retry` prop으로 다시 불러온다", 사용자 여정 1번 "서버가 Notion에서 소품 전체를 읽어 카드 그리드로 그림 (최근 추가가 위) / [Notion 연결 실패] → 오류 상태 표시", 4번 "Notion에서 고친 내용은 약 5분 뒤 방문 시 자동 반영. 개발 서버에서는 즉시 반영". 데이터 모델 `Item` 표 "열 이름 ↔ 필드 매핑은 Notion 연동 코드 한 파일에만 둔다", "종류 … 비어 있으면 웹에서 '기타'로 표시". ROADMAP 가정 "Notion 열 타입: `이름`=title, `상품 링크`=url, `종류`=select, `이미지 URL`=url", "'기타' 처리 시점: 매핑 단계(`src/lib/notion.ts`)에서 `'기타'`로 바꿔 넣고, 화면은 `category` 값을 그대로 쓴다", "더미 데이터의 수명: Task 006에서 실제 데이터로 바꾼 뒤 삭제", "빌드 시 Notion 접근: Task 006부터 `npm run build`가 빌드 중 Notion을 읽어 `/`를 미리 만들므로 `.env.local`과 네트워크가 있어야 build가 통과한다", "클라이언트 경계: `page.tsx`는 서버 컴포넌트로 남겨 Notion을 읽고 `items`를 props로 넘긴다".

## 관련 파일

- 새로 만들 파일: 없음
- 고칠 파일:
  - `src/lib/notion.ts` — 열 이름 상수 `COLUMN`, 도우미 `toSafeUrl()`, 매핑 `toItem()`(이름은 구현 때 정해도 됨), `getItems()` 추가. `fetchAllRows()` 위 주석 "열 이름을 Item으로 바꾸는 매핑은 아직 없다 (Task 006에서 추가)" 현행화
  - `src/app/(marketing)/page.tsx` — `export default async function Home()`, `const items = await getItems()`, `<WishlistView items={items} />`. `mockItems` import 제거. `revalidate = 300` 주석의 "Notion 연결 뒤에도 이 값을 쓴다" 현행화
  - `src/lib/mock-items.ts` — **삭제**
  - `README.md` — 81행 폴더 그림의 `├─ mock-items.ts      화면 확인용 더미 소품 (Notion 연결 뒤 삭제)` 줄 삭제. 3행 "Notion 연동은 아직 없습니다"는 ROADMAP대로 **Task 007**에서 고치지만, 이 Task에서 미리 "Notion 표를 읽어 보여 줍니다"로 고쳐도 무방하다(고치면 변경 요약에 적는다)
- 건드리지 않는 파일:
  - `src/components/features/wishlist/wishlist-view.tsx` — `"use client"`, `items: Item[]` prop. `Item`은 문자열 5개짜리 평범한 객체라 서버 → 클라이언트로 그대로 넘길 수 있다. 칩 목록 `getCategories()`·필터·빈 상태는 데이터만 바뀌면 그대로 동작한다
  - `src/components/features/wishlist/category-chips.tsx`·`item-card.tsx`·`item-grid.tsx` — Task 003~005 산출물. 실제 데이터로 바꿔도 손댈 것이 없다 (ROADMAP "Task 006은 데이터만 바꾸면 되고 카드는 손대지 않음")
  - `src/lib/items.ts` — `Item` 타입과 `OTHER_CATEGORY = "기타"`. 매핑이 **읽기만** 한다
  - `src/app/error.tsx` — F011 공용 오류 화면. `retry` prop으로 "다시 시도". `page.tsx`가 던진 오류를 받는 쪽이라 고칠 것이 없다. 오류 화면·"다시 시도" 동작 확인은 Task 007
- 참고할 기존 코드:
  - `src/lib/notion.ts` 현재 모습(Task 002) — `requireEnv(name: NotionEnvName): string`(환경변수가 없으면 한국어 오류 ``환경변수 ${name}가 없습니다. .env.local을 확인하세요``를 던짐, 함수 안에서만 불러 import만으로는 오류가 안 남). `fetchAllRows(): Promise<PageObjectResponse[]>` — `new Client({ auth })`, `collectPaginatedAPI(notion.dataSources.query, { data_source_id, sorts: [{ timestamp: "created_time", direction: "descending" }] })`, 결과를 `rows.filter(isFullPage)`로 걸러 완전한 페이지 행만 돌려준다. import는 `Client`·`collectPaginatedAPI`·`isFullPage`·`type PageObjectResponse`(`@notionhq/client`)
  - `src/lib/items.ts` — `Item = { id; name; url; imageUrl; category }` 모두 `string`, "없는 값은 빈 문자열("")로 두고, category만은 비면 OTHER_CATEGORY를 넣는다"
  - `src/lib/mock-items.ts` — 삭제 대상. 예외 4종(이미지 없음·깨진 주소·링크 없음·"기타")이 들어 있었으므로, 삭제 뒤에는 **Notion 실제 행**으로 같은 상태를 확인한다(구현 단계 7)
  - `src/app/(marketing)/page.tsx` 현재 모습 — 동기 `Home()`, `PageHeader(title=siteConfig.title, description=siteConfig.description)` + `<WishlistView items={mockItems} />`, `export const revalidate = 300`
  - `src/app/error.tsx` — `ErrorPage({ error, retry })`, `Empty` + "문제가 생겼습니다" + `<Button onClick={() => retry()}>다시 시도</Button>`. `page.tsx`가 `throw`하면 Next.js가 이 화면을 그린다
  - **SDK 타입**(`node_modules/@notionhq/client/build/src/api-endpoints/common.d.ts`, 2026-10-25 확인) — 매핑이 읽을 필드 경로의 근거:
    - `PageObjectResponse`(1290행): `id: IdResponse`(= string), `created_time: string`, `properties: Record<string, PagePropertyValueWithIdResponse>`(1303행)
    - `PagePropertyValueWithIdResponse = IdObjectResponse & (SimpleOrArrayPropertyValueResponse | PartialRollupPropertyResponse)`(1592행) — `type` 문자열로 구분되는 union이므로 `prop.type === "title"`처럼 비교하면 TypeScript가 알아서 좁혀 준다(타입 가드, `any` 불필요)
    - 제목: `TitleArrayBasedPropertyValueResponse = { type: "title"; title: Array<RichTextItemResponse> }`(1912~1915행). `RichTextItemResponse`는 `RichTextItemResponseCommon`(737행 `plain_text: string`)을 포함
    - URL: `UrlSimplePropertyValueResponse = { type: "url"; url: string | null }`(1924~1927행)
    - 선택: `SelectSimplePropertyValueResponse = { type: "select"; select: PartialSelectPropertyValueResponse | null }`(1904~1907행), `PartialSelectPropertyValueResponse = { id: string; name: string; color: "default" | "gray" | … }`(1934~1938행)
    - `isFullPage(response): response is PageObjectResponse`(`helpers.d.ts` 181행) — `fetchAllRows()`가 이미 적용
  - **Next.js 문서**(`node_modules/next/dist/docs/01-app/`) — `02-guides/incremental-static-regeneration.md` 247~249행에 `export const revalidate = 3600`과 `export default async function Page()`가 **같은 파일에 함께** 있는 공식 예제가 있다. 즉 `page.tsx`를 `async`로 바꿔도 ISR과 충돌하지 않는다. 같은 문서 467행 "재검증 중 오류가 나면 마지막으로 성공한 데이터를 캐시에서 계속 제공하고, 다음 요청에서 다시 시도한다"(F011 설명의 "배포본에서는 재생성이 실패해도 이전 내용이 유지" 근거). `01-getting-started/06-fetching-data.md` 29행 "데이터를 가져오려면 컴포넌트를 async 함수로 바꾸고 await한다"
- 읽을 규칙:
  - `CLAUDE.md` "프로젝트 문서" — Notion SDK 5.x는 **데이터 소스 ID**로 조회(`NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`) · 자동 갱신은 `cacheComponents`를 켜지 않고 `export const revalidate = 300` · 개발 서버에서는 캐시가 안 돌아 `npm run build && npm run start`로 확인(이 확인은 Task 007)
  - `CLAUDE.md` "구조" — 계층 `lib` → `components/ui` → … → `app`. `notion.ts`(lib)는 같은 층 `items.ts`만 import하고 `components/`를 import하지 않는다. `page.tsx`(app)가 `lib/notion.ts`와 `features/wishlist`를 import하는 방향은 맞다. error 컴포넌트의 "다시 시도"는 `retry` prop
  - `CLAUDE.md` "코드 규칙" — `any` 금지, named export, 한국어 주석·문구, 기존 파일 방식(큰따옴표, 세미콜론 없음) 유지. `"use client"`는 `page.tsx`에 붙이지 않는다(서버 컴포넌트여야 Notion을 읽고 ISR이 된다)
  - `CLAUDE.md` "명령" — `npm run build`는 lint를 돌리지 않으므로 `npm run lint`(또는 `npm run check-all`)를 따로 돈다. Stop hook이 `src/` 변경 시 `check-all`과 `build`를 자동으로 돌리는데, **이 Task부터 build가 Notion을 읽으므로 `.env.local`이 있어야 hook도 통과한다**
  - `.claude/rules/library-docs.md` — SDK 타입이 헷갈리면 위 d.ts 행을 다시 본다. Next.js는 웹보다 `node_modules/next/dist/docs/` 우선
  - `docs/prd/prd.md` F001·F010·F011 행, 데이터 모델 절(열 표 + `Item` 표), 사용자 여정 1·4번

## 명세

- **`src/lib/notion.ts` — 열 이름 상수**: 파일 위쪽에 `const COLUMN = { name: "이름", url: "상품 링크", category: "종류", imageUrl: "이미지 URL" } as const`. PRD 데이터 모델 "열 이름은 코드에서 그대로 참조하므로 한 번 정하면 바꾸지 않는다"의 참조 지점을 **이 상수 하나**로 모은다. Notion에서 열 이름이 달라지면 이 상수만 고친다(다른 파일에 열 이름을 적지 않는다). 주석에 "Notion 표의 열 이름. 바뀌면 여기만 고친다"를 한국어로 적는다
- **`src/lib/notion.ts` — `toSafeUrl(value: string | null): string`**(export, Task 004 code-reviewer 메모 반영): `null`·빈 문자열이면 `""`. 값이 `"http://"` 또는 `"https://"`로 **시작하지 않으면** `""`. 그 외에는 값 그대로. 이유: 카드(`item-card.tsx`)가 `url`을 `<a href>`에, `imageUrl`을 `<img src>`에 **그대로** 넣으므로 Notion에 `javascript:alert(1)` 같은 값이 들어와도 링크가 되지 않게 막는다(Notion URL 속성은 입력값의 형식을 검사하지 않는다). `상품 링크`·`이미지 URL` 둘 다 이 함수를 거친다. 터미널에서 바로 확인할 수 있게 **export**한다(구현 단계 6). `new URL()` 파싱까지는 하지 않는다(접두어 검사로 충분, 단순하게)
- **`src/lib/notion.ts` — 속성 읽기(타입 가드, `any` 금지)**: 행 하나와 열 이름을 받아 문자열을 돌려주는 작은 도우미를 둔다(예: `readTitle(row, name)`, `readUrl(row, name)`, `readSelect(row, name)` 또는 하나의 `readText`). 공통 규칙 — `const prop = row.properties[name]`을 꺼내 **열이 없거나(`undefined`) `type`이 기대와 다르면 `""`을 돌려준다. 오류를 던지지 않는다**(열 하나가 빠졌거나 타입이 바뀌었다고 사이트 전체가 오류 화면이 되면 안 된다. "이름+링크만 넣는" 입력 원칙과 같은 맥락). 각 타입은 d.ts대로 읽는다:
  - 제목(`이름` → `name`): `prop.type === "title"`이면 `prop.title.map((t) => t.plain_text).join("")`. Notion 제목은 서식(굵게 등)에 따라 여러 조각(`RichTextItemResponse[]`)으로 나뉘므로 `plain_text`를 **이어 붙인다**. 조각이 0개(제목을 비운 행)면 자연히 `""`
  - URL(`상품 링크` → `url`, `이미지 URL` → `imageUrl`): `prop.type === "url"`이면 `toSafeUrl(prop.url)`(`prop.url`은 `string | null`). 타입이 다르면 `""`
  - 선택(`종류` → `category`): `prop.type === "select"`이면 `prop.select?.name ?? ""`(`prop.select`는 `{ id; name; color } | null`). 결과가 `""`이면 **`OTHER_CATEGORY`**(`src/lib/items.ts`)로 바꾼다 — ROADMAP 가정 "'기타' 처리 시점"대로 **매핑 단계에서** 넣고, 화면은 `category`를 그대로 쓴다. 문자열 `"기타"`를 직접 적지 않는다
- **`src/lib/notion.ts` — `getItems(): Promise<Item[]>`**(export): `const rows = await fetchAllRows()` → `rows.map(toItem)`. `toItem(row: PageObjectResponse): Item`은 `{ id: row.id, name: readTitle(row, COLUMN.name), url: readUrl(row, COLUMN.url), imageUrl: readUrl(row, COLUMN.imageUrl), category: readSelect(row, COLUMN.category) }`. **정렬은 하지 않는다**(`fetchAllRows()`가 `created_time` 내림차순으로 이미 최근 추가 순). 환경변수 누락·API 실패(잘못된 키·ID, 네트워크 끊김)는 `fetchAllRows()`가 던지는 오류를 **그대로 위로 보낸다**(try/catch 없음) — F011의 오류 화면이 받을 재료다. `fetchAllRows()`의 `export`는 유지한다(Task 002의 터미널 확인 방식이 계속 쓰임)
- **`src/lib/notion.ts` — import 경로 주의**: `OTHER_CATEGORY`·`type Item`은 `"./items"`(**상대 경로**)로 import한다. 이유: 완료 기준의 터미널 확인(`node --env-file=.env.local … import('./src/lib/notion.ts')`)은 Node가 TS 파일을 바로 실행하는 방식인데, Node는 `tsconfig.json`의 `@/` 별칭을 몰라 `@/lib/items`를 찾지 못한다. 같은 `lib/` 폴더 안이라 상대 경로도 계층 규칙에 어긋나지 않는다. 주석으로 이유를 한 줄 적는다(다른 파일은 `@/` 그대로)
- **`src/lib/notion.ts` — 주석 현행화**: `fetchAllRows()` 위 "열 이름을 Item으로 바꾸는 매핑은 아직 없다 (Task 006에서 추가). SDK 응답 행을 그대로 돌려준다" → "열 이름을 Item으로 바꾸는 매핑은 getItems()가 한다. 이 함수는 SDK 응답 행을 그대로 돌려준다"처럼 현재 상태로. 파일 맨 위에 "Notion 연결과 소품 표 읽기. 열 이름 ↔ Item 매핑은 이 파일에만 둔다" 한 줄을 두면 README 폴더 그림(`notion.ts  Notion 연결과 소품 표 읽기`)과 맞는다
- **`src/app/(marketing)/page.tsx`**: `import { getItems } from "@/lib/notion"` 추가, `import { mockItems } from "@/lib/mock-items"` 삭제. `export default async function Home()`으로 바꾸고 `const items = await getItems()` 뒤 `<WishlistView items={items} />`. **try/catch 하지 않는다** — 오류를 그대로 던져 `app/error.tsx`(F011, `retry` prop)가 받게 한다. `export const revalidate = 300`은 그대로 두고(F010), 주석 "(F010 자동 갱신 자리. Notion 연결 뒤에도 이 값을 쓴다)"를 "(F010 자동 갱신. 이 페이지는 빌드 때 Notion을 읽어 미리 만들고, 5분이 지나면 다음 방문 때 뒤에서 다시 읽는다)"처럼 현행화. `"use client"`·`dynamic`·`cacheComponents` 설정은 넣지 않는다. Next.js 문서(ISR 가이드 247~249행)대로 `async` 페이지 + `revalidate` 조합은 공식 예제 그대로이므로 build 라우트 표에서 `/`가 여전히 `○` Revalidate 5m으로 나와야 한다(`ƒ`(동적)로 바뀌면 `cookies()`·`headers()`·`searchParams` 같은 동적 API가 섞인 것 — 이 Task에서는 쓸 일이 없다)
- **`src/lib/mock-items.ts` 삭제**: `git rm`은 developer 에이전트가 못 쓰므로 `rm src/lib/mock-items.ts`(또는 파일 삭제)로 지우고, 커밋은 `/ship`에서 삭제가 함께 올라간다. 삭제 뒤 `grep -rn "mock-items\|mockItems" src/`가 **비어야** 한다(PRD·ROADMAP·plans의 문서 언급은 그대로 둔다 — 역사 기록). `items.ts`의 `OTHER_CATEGORY`는 `wishlist-view.tsx`와 `notion.ts`가 쓰므로 그대로 남는다
- **`README.md`**: 81행 `├─ mock-items.ts …` 줄 삭제(폴더 그림만 현행화). 3행 "Notion 연동은 아직 없습니다"는 Task 007 몫이지만 미리 고쳐도 됨(선택)
- **빌드와 환경변수(ROADMAP 가정 "빌드 시 Notion 접근")**: 이 Task부터 `npm run build`가 빌드 중 `/`를 미리 만들면서 `getItems()`를 실제로 호출한다. 따라서 `.env.local`(Next.js가 build 때도 읽음)과 네트워크가 있어야 build가 통과한다. `.env.local`이 없거나 변수 하나가 비면 `requireEnv`의 한국어 메시지(`환경변수 NOTION_API_KEY가 없습니다. .env.local을 확인하세요`)로 build가 **실패하는 것이 정상**이며, 이것이 F011 "원인 노출"의 일부다. Stop hook의 자동 build도 같은 조건이다
- **공통**: 기존 파일 방식(큰따옴표, 세미콜론 없음, 한국어 주석) 유지. `any`·타입 단언(`as PageObjectResponse` 등) 없이 `prop.type` 비교로 좁힌다. `features/`·`components/`를 `lib`에서 import하지 않는다. 화면 문구 변경 없음(이 Task는 데이터만 바꾼다)

## 구현 단계

- [x] 1. `src/lib/notion.ts` — 맨 위 import에 `import { OTHER_CATEGORY, type Item } from "./items"`(상대 경로, 이유 주석) 추가. `COLUMN` 상수(`이름`·`상품 링크`·`종류`·`이미지 URL`) 추가. `export function toSafeUrl(value: string | null): string` 추가(`null`/빈 값 → `""`, `http://`·`https://`로 시작하지 않으면 `""`)
- [x] 2. `src/lib/notion.ts` — 속성 읽기 도우미(제목 `plain_text` 이어 붙임 / URL `toSafeUrl(prop.url)` / 선택 `prop.select?.name ?? ""` → 비면 `OTHER_CATEGORY`). 열이 없거나 `type`이 다르면 `""`을 돌려주고 오류를 던지지 않는다. `toItem(row): Item`과 `export async function getItems(): Promise<Item[]>`(`fetchAllRows()` → `map(toItem)`, 정렬·try/catch 없음). `fetchAllRows()` 위 주석과 파일 맨 위 설명 현행화
- [x] 3. `src/app/(marketing)/page.tsx` — `mockItems` import 삭제, `getItems` import 추가, `export default async function Home()` + `const items = await getItems()` + `<WishlistView items={items} />`. `revalidate = 300` 유지, 주석 현행화. try/catch 없음
- [x] 4. `src/lib/mock-items.ts` 삭제(`rm`). `grep -rn "mock-items\|mockItems" src/`가 비어 있는지 확인. `README.md` 81행 `mock-items.ts` 줄 삭제(3행은 선택)
- [x] 5. `npm run lint`(또는 `npm run check-all`) → `npm run build`(`.env.local` 있는 상태). build 라우트 표에서 `/`가 **`○` Revalidate 5m**으로 남아 있는지 확인. 빌드 로그에 Notion 오류가 없는지 확인
- [x] 6. 터미널 확인 — `node --env-file=.env.local --input-type=module -e "import('./src/lib/notion.ts').then(m => m.getItems()).then(r => console.log(r.length, r[0]))"`로 행 개수(Task 002 기준 7행 전후)와 첫 `Item`의 5개 필드가 모두 문자열이고 `category`가 비어 있지 않은지 본다. 이어서 `node --input-type=module -e "import('./src/lib/notion.ts').then(m => console.log(JSON.stringify([m.toSafeUrl('https://a.com/x'), m.toSafeUrl('http://a.com'), m.toSafeUrl('javascript:alert(1)'), m.toSafeUrl('a.com'), m.toSafeUrl(''), m.toSafeUrl(null)])))"` → `["https://a.com/x","http://a.com","","","",""]`가 찍히는지 확인(환경변수 없이도 돌아간다 — `requireEnv`는 함수 안에서만 불리기 때문)
- [x] 7. 브라우저 확인(`lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 dev 서버 확인 후 `npm run dev`, `/` 열기) — Notion의 실제 소품이 **최근 추가 순**(Notion 표를 생성 시각 내림차순으로 정렬해 비교)으로 카드에 보이고, 이름·이미지·종류 배지가 Notion 값과 일치. 칩이 **실제 종류 값**에서 등장 순서대로 만들어지고 "기타"가 있으면 맨 끝. 칩 클릭 → 해당 종류만, 주소 불변. 카드 클릭 → 상품 링크 새 탭. 1280px 4열·375px 2열. 스크린샷 `.playwright-mcp/task-006-desktop.png`·`task-006-mobile.png`
- [x] 8. 브라우저 확인(예외 처리가 실제 데이터로 동작) — Notion에 이미지 URL이 빈 행·상품 링크가 빈 행·종류가 빈 행이 있으면 각각 대체 그림(`ImageOff` + `bg-muted`)·`<div>` 카드(흐린 배지, 클릭 무반응)·"기타" 배지가 나오는지 확인. **그런 행이 없으면 Notion에 테스트 행을 하나 추가**(예: 이름만 넣고 나머지 비움 → 대체 그림 + 링크 없음 + "기타" 세 가지를 한 행으로 확인)해 dev 서버 새로 고침으로 확인한 뒤 지워도 된다. 스크린샷 `.playwright-mcp/task-006-exceptions.png`. 콘솔에 "An empty string was passed to the src attribute" 오류가 없는지(`imageUrl: ""`이면 `<img>`를 안 그리므로 없어야 함)
- [x] 9. `git status`·`git diff --stat`으로 변경이 `src/lib/notion.ts`(수정)·`src/app/(marketing)/page.tsx`(수정)·`src/lib/mock-items.ts`(삭제)·`README.md`(수정) **4개뿐**인지 확인. `wishlist-view.tsx`·`category-chips.tsx`·`item-card.tsx`·`item-grid.tsx`·`items.ts`·`error.tsx`·`src/components/ui/` 변경 없음. Notion 테스트 행을 넣었다면 지웠는지 확인

## 완료 기준

- [x] `npm run lint` 통과(경고 0). `any`·타입 단언 없음
- [x] `npm run build` 통과(`.env.local` 있는 상태). 라우트 표에서 `/` **`○` Revalidate 5m 유지**(`async` 페이지로 바꿔도 ISR이 깨지지 않음)
- [x] `src/lib/mock-items.ts` 삭제, `grep -rn "mock-items\|mockItems" src/` 결과 0건. `README.md` 폴더 그림에서 `mock-items.ts` 줄 삭제
- [x] 터미널 확인: `getItems()`가 Notion 행 개수만큼의 `Item[]`을 돌려주고, 첫 항목의 5개 필드가 모두 문자열(`id`는 Notion 페이지 ID, `category`는 빈 문자열 아님)
- [x] 터미널 확인: `toSafeUrl`이 `https://…`·`http://…`는 그대로, `javascript:…`·`a.com`(접두어 없음)·`""`·`null`은 `""`로 바꿈
- [x] 브라우저 확인: `/`에 Notion의 실제 소품이 최근 추가 순으로 카드(이미지·이름·종류 배지)로 보임. 칩이 실제 종류 값에서 만들어지고 "전체"가 맨 앞, "기타"(있으면) 맨 끝. 칩 필터·새 탭 링크·2열/4열이 더미 때와 같이 동작
- [x] 브라우저 확인: 이미지 없는 행 → 대체 그림, 링크 없는 행 → `<div>` 카드 + 흐린 배지 + 클릭 무반응, 종류 없는 행 → "기타" 배지가 **실제 Notion 데이터**로 동작(없으면 테스트 행으로 확인 후 삭제). 콘솔 오류 0건(외부 이미지 요청 실패는 깨진 주소일 때만 정상)
- [x] 변경 파일이 `src/lib/notion.ts`·`src/app/(marketing)/page.tsx`·`src/lib/mock-items.ts`(삭제)·`README.md` **4개뿐**. `wishlist-view.tsx`·`category-chips.tsx`·`item-card.tsx`·`item-grid.tsx`·`items.ts`·`error.tsx` 변경 없음
- [x] 스크린샷 `.playwright-mcp/task-006-desktop.png`·`task-006-mobile.png`·`task-006-exceptions.png`

## 범위 밖 메모

- **ISR 5분 갱신의 실제 확인**(`npm run build && npm run start` → Notion 수정 → 5분 뒤 새로 고침 두 번)과 **오류 화면·"다시 시도" 확인**(`NOTION_API_KEY`를 일부러 틀리게 → `app/error.tsx` → 되돌린 뒤 `retry`)은 **Task 007**. 이 Task에서는 `revalidate = 300`이 유지되고(build 표 `○` 5m) 오류가 try/catch 없이 위로 던져지는 **구조**만 만든다. dev 서버에서 Notion 오류가 나면 Next.js 개발용 오류 오버레이와 `error.tsx`가 함께 보일 수 있는데, 이는 정상이며 자세한 확인은 Task 007
- **배포와 Vercel 환경변수 등록**은 **Task 008**
- Task 004 code-reviewer 메모 "링크 안에서 `<img alt>`와 이름 `<p>`가 중복되어 스크린리더가 소품 이름을 두 번 읽음"은 **카드(`item-card.tsx`) 쪽 일**이라 이 Task 범위 밖. 별도 작은 수정으로 처리한다(이 Task 커밋에 섞지 않는다)
- ROADMAP의 미확인 메모 "`category-chips.tsx`의 `overflow-x-auto` 때문에 칩의 키보드 포커스 링이 위아래로 잘릴 수 있음(추정)" — 실제 데이터 확인 중 Tab 키로 칩을 지날 때 눈에 띄면 이 Task 커밋에 섞지 않고 별도 작은 수정(예: 칩 바깥 `div`에 `py-1`)으로 처리
- 열 이름이 Notion과 다를 때의 대응은 `COLUMN` 상수 수정이지 코드 구조 변경이 아니다. Notion 열 타입이 가정과 다르게 바뀌면(예: `상품 링크`가 텍스트 열로) 해당 읽기 도우미만 고친다(ROADMAP 가정 "Notion 열 타입")
- `README.md` 3행 "Notion 연동은 아직 없습니다"는 Task 007에서 고치는 것이 ROADMAP 계획이지만, 이 Task에서 미리 고쳐도 무방하다

## 변경 요약

- 고친 파일: `src/lib/notion.ts` — 맨 위 설명 주석 "Notion 연결과 소품 표 읽기. 열 이름 ↔ Item 매핑은 이 파일에만 둔다" 추가. `import { OTHER_CATEGORY, type Item } from "@/lib/items"`(코드베이스 관례대로 별칭 유지 — 상대 경로도 Node가 못 찾아 바꿀 의미가 없음). `COLUMN = { name: "이름", url: "상품 링크", category: "종류", imageUrl: "이미지 URL" } as const`. `export function toSafeUrl(value: string | null): string`(falsy → `""`, `http://`·`https://` 접두어만 통과, `new URL()` 없음). 속성 읽기 도우미 `readTitle`·`readUrl`·`readSelect`(각 `(row: PageObjectResponse, name: string) => string`, `row.properties[name]`을 꺼내 `prop?.type` 비교로 좁힘 — 열이 없거나 타입이 다르면 `""`, `readSelect`는 비면 `OTHER_CATEGORY`). `toItem(row): Item`(export 안 함), `export async function getItems(): Promise<Item[]>`(`fetchAllRows()` → `map(toItem)`, 정렬·try/catch 없음). `fetchAllRows()` 위 주석을 "매핑은 getItems()가 한다"로 현행화. `src/app/(marketing)/page.tsx` — `mockItems` import 삭제, `import { getItems } from "@/lib/notion"`, `export default async function Home()` + `const items = await getItems()` + `<WishlistView items={items} />`. `revalidate = 300` 유지, 주석 현행화. try/catch 없음. `README.md` — 3행 "Notion 연동은 아직 없습니다" → "Notion 데이터 소스에서 소품을 읽어 보여 줍니다"(계획 파일 결정 4번대로 미리 고침), 폴더 그림의 `mock-items.ts` 줄 삭제
- 삭제한 파일: `src/lib/mock-items.ts`(`rm`). `grep -rn "mock-items\|mockItems" src/` 0건
- 결정 사항: 도우미는 범용 `readText` 하나가 아니라 타입별 세 함수(계획 파일 결정 1번). `any`·타입 단언 없이 `prop?.type === "title"` 같은 비교로 좁힘(d.ts `PagePropertyValueWithIdResponse`가 `type`으로 구분되는 union). `readSelect`의 "기타" 처리는 매핑 단계 한 곳에서만. 화면 문구·화면 부품 변경 없음
- 확인: `npm run lint` 통과(경고 0) · `npm run build` 통과(빌드 로그 `- Environments: .env.local`, Notion 오류 없음, 라우트 표 `○ /  5m  1y` 유지) · `npm run check-all` 통과 · 터미널 1 `getItems()` → `7`행, 첫 항목 `{"id":"3f4d581f-…","name":"홈앤힐 포비 … 소파, 블랙네이비, 3인용","url":"https://brand.naver.com/…","imageUrl":"https://brand.naver.com/…#ZOOM","category":"소파"}`, 5개 필드 모두 `string`, 종류 목록 `["소파","소파","라운지체어","그릇","라운지체어","소파","수납"]`(빈 값 0) · 터미널 2 `toSafeUrl` → `["https://a.com","http://a.com","","","",""]`(환경변수 없이 실행) · `git status --short` 변경이 `notion.ts`(M)·`page.tsx`(M)·`mock-items.ts`(D)·`README.md`(M) 4개뿐, `src/components/`·`items.ts`·`error.tsx` 변경 없음
- 터미널 확인 방법의 어긋남: 작업 파일 단계 6의 `node … import('./src/lib/notion.ts')` 명령은 그대로는 `ERR_MODULE_NOT_FOUND`로 실패한다 — Node ESM은 tsconfig의 `@/` 별칭도, 확장자 없는 상대 경로(`./items`)도 못 풀기 때문. 그래서 import는 `@/lib/items`로 유지하고(상대 경로로 바꿔도 의미 없음), 터미널 확인은 프로젝트 밖 스크래치패드에 둔 `node:module.registerHooks` resolve 훅(`@/` → `src/`, 못 찾으면 `.ts` 보완)을 `node --import <훅> …`으로 끼워 수행했다. 프로젝트 파일(`tsconfig.json` 포함)은 바꾸지 않았다. 앞으로의 끝-대-끝 확인은 터미널이 아니라 브라우저와 `npm run build`로 한다
- 남긴 일: 브라우저 확인 단계 7~9(메인 대화). Notion 7행 모두 링크·이미지·종류가 채워져 있어 예외 행이 없고, 사용자 결정으로 테스트 행을 추가하지 않으므로 단계 8의 예외 확인은 생략(터미널 `toSafeUrl` 확인으로 대체, 스크린샷 `task-006-exceptions.png` 없음). 앞 4행의 `이미지 URL`이 상품 페이지 주소(naver.com)라 브라우저에서 대체 그림이 나올 수 있음(데이터 문제, 정상). ISR 5분 갱신 실제 확인과 오류 화면·"다시 시도" 확인은 Task 007, Vercel 배포는 Task 008

- 브라우저 확인 결과(headless Chrome + playwright-core 스크립트, dev 서버, 2026-10-25): 카드 7장이 Notion 생성 시각 내림차순(첫 "홈앤힐 포비 이지클린 구스 스윙 패브릭 소파", 마지막 "STEEL TRUNK / 22L"), 이름·종류 배지가 Notion 값과 일치. 칩 `전체 · 소파 · 라운지체어 · 그릇 · 수납`(등장 순서, "기타" 없음), "소파" 클릭 → 3장·주소 `http://localhost:3000/` 불변, "전체" 복귀 7장. 7장 모두 `<a target="_blank" rel="noopener noreferrer">`, 첫 카드 클릭 → 새 탭에 naver 상품 주소, 원래 탭 유지. 375px 2열, 칩 한 줄. 콘솔 React 오류 0건. 이미지: naver 상품 페이지 주소 4건(`#ZOOM` 포함)은 `net::ERR_BLOCKED_BY_ORB`로 브라우저가 이미지로 못 읽어 Task 004 대체 그림이 나옴(데이터 입력 문제, 코드 정상 동작 확인), linenworld·puebco 3건 정상 로드. 스크린샷 `.playwright-mcp/task-006-desktop.png`·`task-006-mobile.png`
- 예외 행 브라우저 확인(단계 8·`task-006-exceptions.png`): 7행 모두 값이 채워져 있고 사용자 결정(2026-10-25)으로 테스트 행을 추가하지 않아 **생략**. 빈 값 → `""`·"기타" 매핑은 `toSafeUrl` 터미널 확인과 Task 004·005의 더미 검증으로 대체. 대체 그림은 위 naver 4건으로 실제 데이터에서 확인됨
- 변경 파일 확인(단계 9): `git status`에서 `notion.ts`(M)·`page.tsx`(M)·`mock-items.ts`(D)·`README.md`(M) 4개 + 문서. `src/components/`·`items.ts`·`error.tsx` 변경 없음
- 남긴 일: 없음. 다음은 Task 007(ISR 5분 갱신·오류 화면 확인). 데이터 메모: Notion 앞 4행의 `이미지 URL`을 실제 이미지 파일 주소로 바꾸면 사진이 보인다
