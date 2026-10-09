# PRD 기술적 검증 결과: project-notion-cms (인테리어 소품 후보 모아보기)

검증 대상: `docs/prd/2026-10-09-project-notion-cms-prd.md` · 검증일: 2026-10-09

> 이 문서의 모든 판단은 **관찰 → 근거 → 결론** 세 항목으로 적었다. 태그 뜻: [FACT] 설치된 코드나 공식 문서로 확인한 사실(출처 병기) · [INFERENCE] 사실에서 따라오는 판단 · [UNCERTAIN] 확인 못 한 추측 · [ASSUMPTION] 명시한 가정 · [ALTERNATIVE] 대안 · [LIMITATION] 제약.
>
> MVP PRD 원칙에 따라 보안·성능·일정·API 라우트·인프라·페르소나 섹션의 **부재는 지적하지 않았다.** 기술 선택과 데이터 모델이 그것을 구조적으로 막는지만 봤다.

## 📋 검증 요약

### 검증 경로

1. **초기 관찰**: 화면 하나짜리 읽기 전용 사이트. 데이터는 Notion 데이터베이스 1개, 서버(Next.js)가 읽어 ISR로 캐시, 브라우저에서 종류 칩으로 거른다. 외부 의존은 Notion API 하나와 쇼핑몰 이미지 URL(불특정 다수 호스트).
2. **검증 대상 주장**: ① 기술 스택 버전이 설치 상태와 일치 ② `@notionhq/client` 5.x로 데이터 소스 조회·생성 시각 역순 정렬·속성(제목·URL·선택) 읽기 가능 ③ Next.js 16.3.8에서 "5분 ISR" 구현 가능 ④ 기존 `error.tsx`("다시 시도")가 Notion 실패를 받아낼 수 있음 ⑤ `robots noindex` 메타 설정 가능 ⑥ 비밀 키가 클라이언트에 노출되지 않는 구조 ⑦ Notion 직접 업로드 이미지 URL이 1시간마다 바뀜 ⑧ `next/image`는 도메인 허용 목록이 필요 ⑨ Vercel 무료 플랜에서 ISR 가능
3. **단계적 검증**: ①✅ ②✅(단, "데이터베이스 ID"가 아니라 **데이터 소스 ID**가 필요) ③✅(단, `cacheComponents`가 꺼져 있어 **구 캐시 모델**의 `export const revalidate = 300`을 써야 함) ④✅ ⑤✅ ⑥✅ ⑦✅ ⑧✅ ⑨✅
4. **논리적 연결**: 기능 ID ↔ 페이지 ↔ 메뉴 ↔ 데이터 모델은 PRD 안에서 완결. 저장소와의 차이 두 곳(메뉴 3개 vs "홈 하나", `/dashboard` 경로 존속)과 기준 기획 문서와의 차이 한 곳(사이트 이름 결정 여부).
5. **종합 판단**: 기술적으로 실현 가능하며 Critical Issue 없음. Major 4건(데이터 소스 ID, ISR 구현 방식 명시, noindex 적용 위치, 사이트 이름 불일치)을 PRD에 반영하면 바로 구현 가능 → **⚠️ 조건부 통과**.

### 태그 집계

- [FACT] 24건 (출처 확인된 사실)
- [INFERENCE] 15건 (사실에서 따라오는 판단)
- [UNCERTAIN] 6건 (추가 검증 필요)
- [ASSUMPTION] 3건 (명시한 가정)

### 주요 발견사항

- **예상과 일치**: 스택 버전 전부 일치. Notion API가 PRD의 모든 요구(전체 조회, 생성 시각 역순, 제목·URL·선택 속성, 보관 행 제외)를 제공. 기존 `error.tsx`가 Next.js 16.3.8 문서의 `retry` 규약과 이미 일치.
- **예상과 다른 점**: (1) Notion SDK 5.x는 `database_id`가 아닌 `data_source_id`로 조회한다. 기준 기획 문서는 `NOTION_DATABASE_ID`만 적어 두었다. (2) Next.js 16의 새 캐시 문서(`cacheLife`)는 `cacheComponents: true`일 때만 적용되는데 이 저장소는 꺼져 있다. PRD의 "ISR 5분"은 구 모델(`export const revalidate = 300`)로 구현해야 하며, 개발 서버에서는 캐시가 동작하지 않아 검증 방법이 다르다.
- **추가 고려사항**: Vercel에서는 재생성 실패 시 이전 캐시를 계속 내보내므로, F011의 오류 화면은 실제로는 "캐시가 아직 없는 첫 렌더"와 개발 환경에서 주로 보인다. `<img>` 사용은 ESLint 경고(`warn`)를 낸다. 색인 거부를 소품 목록 페이지에만 걸면 남아 있는 `/dashboard` 경로는 빠진다.

## 🎯 단계별 검증 결과

### Step 0: 사실 확인

- **프로젝트 상태**: PRD 기술 스택과 설치 상태 **일치**.
  - [FACT] `node_modules/next/package.json` 16.3.8 · `react` 19.3.0 · `typescript` 5.9.3 · `tailwindcss` 4.3.3 · `shadcn` 4.21.1 · `eslint` 9.39.5 — PRD "기술 스택" 섹션의 숫자와 모두 같다 (`/Users/ky.moon/workspace1/project-notion-cms/node_modules/{next,react,typescript,tailwindcss,shadcn,eslint}/package.json`).
  - [FACT] `package.json`에 `@notionhq/client`는 없다. PRD가 "(설치 예정)"으로 표기한 것과 일치 (`/Users/ky.moon/workspace1/project-notion-cms/package.json`).
  - [FACT] `next.config.ts`에는 `devIndicators`만 있고 `cacheComponents`는 켜져 있지 않다 (`/Users/ky.moon/workspace1/project-notion-cms/next.config.ts`).
  - [FACT] PRD가 쓰겠다는 shadcn 부품(card, badge, button, empty)이 `src/components/ui/`에 실제로 있다 (Glob `src/**/*.tsx`).
- **확인한 문서**:
  - 저장소: `package.json`, `README.md`, `next.config.ts`, `.claude/rules/library-docs.md`, `.claude/rules/dependencies.md`, `plans/2026-10-09-project-notion-cms-interior-service-plan.md`, `src/app/error.tsx`, `src/app/layout.tsx`, `src/app/(marketing)/layout.tsx`, `src/components/layout/site-header.tsx`, `src/lib/site.ts`
  - Next.js 설치 문서(`node_modules/next/dist/docs/01-app/`): `01-getting-started/09-revalidating.md`, `01-getting-started/10-error-handling.md`, `01-getting-started/14-metadata-and-og-images.md`, `02-guides/caching-without-cache-components.md`, `02-guides/environment-variables.md`, `02-guides/building.md`, `03-api-reference/03-file-conventions/error.md`, `03-api-reference/03-file-conventions/02-route-segment-config/index.md`, `03-api-reference/04-functions/generate-metadata.md`, `03-api-reference/05-config/01-next-config-js/cacheComponents.md`, `03-api-reference/02-components/image.md`
  - ESLint: `node_modules/@next/eslint-plugin-next/dist/index.js`
  - Notion(웹): `https://github.com/makenotion/notion-sdk-js` 및 `https://raw.githubusercontent.com/makenotion/notion-sdk-js/main/README.md`, `https://registry.npmjs.org/@notionhq/client/latest`, `https://developers.notion.com/reference/query-a-data-source`, `https://developers.notion.com/reference/page-property-values`, `https://developers.notion.com/reference/file-object`, `https://developers.notion.com/reference/request-limits`, `https://developers.notion.com/reference/intro`, `https://developers.notion.com/docs/upgrade-guide-2025-09-03`
  - Vercel(웹): `https://vercel.com/docs/incremental-static-regeneration`
  - 읽지 못한 것: `https://www.npmjs.com/package/@notionhq/client` (403). 대신 registry JSON으로 확인.
- **확인된 사실** (Notion):
  - [FACT] `@notionhq/client` 최신 공개 버전은 **5.27.0**, `engines.node >= 18` (`https://registry.npmjs.org/@notionhq/client/latest`). PRD의 "5.27.0"과 일치.
  - [FACT] SDK README: 조회는 `notion.dataSources.query({ data_source_id, filter })`. 헬퍼 `iteratePaginatedAPI`, `collectPaginatedAPI`, `iterateAllDataSourceRows`, `collectAllDataSourceRows` 제공. 최소 요구 `node >= 18`, 타입 정의는 `typescript >= 5.9`(선택). 지원 `Notion-Version`은 `2025-09-03`(기본)과 `2026-03-11` (`https://raw.githubusercontent.com/makenotion/notion-sdk-js/main/README.md`, `https://github.com/makenotion/notion-sdk-js`).
  - [FACT] 2025-09-03 업그레이드 가이드: `PATCH /v1/databases/:id/query` → `PATCH /v1/data_sources/:data_source_id/query`로 이동, TS SDK에서는 `notion.databases.query` → `notion.dataSources.query`. `GET /v1/databases/:database_id`가 `data_sources: [{ id, name }]` 배열을 돌려주며, Notion 앱의 데이터베이스 설정 "Manage data sources"에 **"Copy data source ID"** 버튼이 있다. "Database IDs and data source IDs are not interchangeable" (`https://developers.notion.com/docs/upgrade-guide-2025-09-03`).
  - [FACT] Query a data source: 요청 본문 `filter`, `sorts`, `start_cursor`, `page_size`, `is_archived`. 정렬은 `{ "timestamp": "created_time" | "last_edited_time", "direction": "ascending" | "descending" }` 또는 속성 기준. 필터 없이 호출하면 **보관(archived)되지 않은 페이지만** 반환. 통합에 read content 권한이 없으면 403, 데이터베이스가 통합에 공유되지 않았으면 404 (`https://developers.notion.com/reference/query-a-data-source`).
  - [FACT] 속성 값 형태: `title` → rich text 배열(각 항목에 `plain_text`), `url` → 문자열 또는 `null`, `select` → `{ id, name, color }` 또는 `null`, `created_time` → ISO 8601 문자열 (`https://developers.notion.com/reference/page-property-values`).
  - [FACT] 파일 객체: Notion이 호스팅하는 파일 URL은 "valid for one hour", `expiry_time` 포함. 외부(`external`) URL은 "never expire" (`https://developers.notion.com/reference/file-object`). PRD 데이터 모델의 "Notion에 직접 올린 사진은 주소가 1시간마다 바뀌어 쓰지 않음"과 일치.
  - [FACT] 요청 한도: Business·Enterprise 외 플랜은 통합당 **180회/분**(평균 3회/초). 초과 시 429 + `Retry-After`(초). URL 속성은 **2000자** 제한 (`https://developers.notion.com/reference/request-limits`).
  - [FACT] 페이지네이션: `page_size` 기본·최대 **100**. 응답에 `has_more`, `next_cursor`, `results` (`https://developers.notion.com/reference/intro`). 같은 문서 본문에 "ten items per API call"이라는 문장도 있어 표와 어긋난다 — 최대값 100은 양쪽 모두 같다.
- **확인된 사실** (Next.js 16.3.8, 설치 문서):
  - [FACT] 구 캐시 모델 가이드는 "이 가이드는 Cache Components를 **쓰지 않는** 경우"를 전제로 하며, 라우트 세그먼트 `export const revalidate = <number>`(초)로 페이지 재검증 주기를 정한다. 값은 정적으로 분석 가능해야 하고(`600`은 되고 `60 * 10`은 안 됨), **개발 모드에서는 페이지가 항상 요청마다 렌더되어 캐시되지 않는다** (`02-guides/caching-without-cache-components.md` L7, L165-187).
  - [FACT] 라우트 세그먼트 설정 색인의 버전 이력: `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`는 **Cache Components가 켜진 경우에만** 제거됨 (`03-file-conventions/02-route-segment-config/index.md` L19). 즉 이 저장소(꺼짐)에서는 `revalidate`를 쓸 수 있다.
  - [FACT] 새 모델의 `cacheLife`/`use cache`는 `cacheComponents: true`일 때 쓰는 기능 (`01-getting-started/09-revalidating.md` L15, `05-config/01-next-config-js/cacheComponents.md` L16-35).
  - [FACT] `error.tsx`의 props는 `error`와 `retry: () => void`. "같은 세그먼트의 `layout.js`는 감싸지 않고" 그 아래 `page.js`와 하위 `layout.js`를 감싼다 (`03-file-conventions/error.md` L25-31, L96). 프로덕션에서 서버 컴포넌트 오류의 `message`는 일반 문구로 바뀌고 `digest`만 전달된다 (L106-115).
  - [FACT] 저장소의 `src/app/error.tsx`는 이미 `retry` prop을 쓰고 shadcn `Empty`로 "다시 시도" 버튼을 그린다 (`/Users/ky.moon/workspace1/project-notion-cms/src/app/error.tsx`).
  - [FACT] `Metadata.robots` 필드가 있고 `index`, `follow` 등 불리언을 받아 `<meta name="robots" content="...">`로 출력된다. `robots`처럼 중첩된 필드는 "뒤 세그먼트가 정의하면 앞 세그먼트 값을 **덮어쓴다**" (`04-functions/generate-metadata.md` L551-579, L1348).
  - [FACT] `NEXT_PUBLIC_` 접두사가 없는 환경변수는 Node.js 환경에서만 읽을 수 있고 브라우저에는 가지 않는다 (`02-guides/environment-variables.md` L156).
  - [FACT] `next/image`의 외부 URL은 `remotePatterns`에 등록해야 하며, `hostname: '**.example.com'`처럼 서브도메인 와일드카드를 지원한다 (`03-api-reference/02-components/image.md` L71, L533-587).
  - [FACT] `eslint-config-next`의 `@next/next/no-img-element` 규칙 수준은 `'warn'` (`node_modules/@next/eslint-plugin-next/dist/index.js` L87).
- **확인된 사실** (Vercel):
  - [FACT] "Incremental Static Regeneration is available on all plans." 재검증 실패 시 기존 캐시를 계속 내보내고 30초 뒤 재시도한다 (`https://vercel.com/docs/incremental-static-regeneration`).
- **확인된 사실** (저장소 ↔ 기준 문서):
  - [FACT] 기준 기획 문서 10장: "사이트 이름: **Living Wishlist** (2026-10-09 결정). Notion 데이터베이스 이름도 같게 함" (`plans/2026-10-09-project-notion-cms-interior-service-plan.md` L109). PRD 가정 섹션은 "아직 정하지 않은 것"으로 보고 "인테리어 소품 후보 모아보기"를 가정했다.
  - [FACT] 기준 기획 문서 3장은 비밀값으로 `NOTION_API_KEY`, `NOTION_DATABASE_ID`만 적었다 (같은 파일 L41).
  - [FACT] `src/lib/site.ts`의 `mainNav`는 "홈·대시보드·컴포넌트 둘러보기" 3개이고 `src/app/(dashboard)/dashboard/page.tsx` 경로가 존재한다. PRD 메뉴 구조는 "홈 하나".
- **대안·제약**:
  - [ALTERNATIVE] 데이터 소스 ID는 (a) Notion 앱의 "Copy data source ID", (b) `databases.retrieve`의 `data_sources[0].id`, 두 방법으로 얻을 수 있다.
  - [ALTERNATIVE] 종류 칩을 소품에서 추출하는 대신 `GET /v1/data_sources/:id`(스키마, `properties` 포함)에서 선택지 목록을 읽으면 소품이 0개인 종류도 칩에 나온다 (업그레이드 가이드).
  - [ALTERNATIVE] `app/(marketing)/error.tsx`를 두면 머리글·바닥글은 남긴 채 본문만 오류 화면으로 바뀐다 (error.md L96: 같은 세그먼트 layout은 감싸지 않음).
  - [LIMITATION] 조회 응답은 한 번에 최대 100행. 그 이상은 `next_cursor`로 반복해야 한다.
  - [LIMITATION] 무료 플랜 Notion 통합은 180회/분. ISR 5분이면 재생성당 호출 1~2회이므로 여유가 매우 크다.
  - [LIMITATION] 개발 서버(`next dev`)에서는 ISR 캐시가 동작하지 않으므로 "5분 뒤 반영"은 `npm run build && npm run start`로만 확인할 수 있다.

### Step 1: 초기 분석

- **관찰**: 프로젝트 유형은 읽기 전용 단일 페이지 사이트(헤드리스 CMS 뷰어). 스택은 Next.js 16.3.8 App Router + React 19.3 + TypeScript 5.9 + Tailwind 4 + shadcn/ui, 데이터는 Notion 데이터베이스 1개, 추가 라이브러리는 `@notionhq/client` 하나. 핵심 기능 F001~F004(그리드·링크·칩 필터·빈 상태), 지원 기능 F010~F012(ISR·오류 화면·noindex).
- **근거**: PRD "핵심 정보", "기능 명세", "데이터 모델", "기술 스택" 섹션.
- **결론**: 구현하려는 것은 "Notion 표 → 서버 캐시 → 카드 그리드" 한 줄의 파이프라인이다. 예상되는 기술적 도전은 (1) Notion SDK 5.x의 데이터 소스 개념과 (2) Next.js 16의 두 캐시 모델 중 어느 것을 쓰는지 정확히 짚는 일이며, 나머지는 표준 React 컴포넌트 작업이다.
- **검증이 필요한 핵심 주장**: 위 "검증 경로 2번"의 ①~⑨.

### Step 2: API/라이브러리 검증

#### 주장 #1: 기술 스택 버전이 설치 상태와 일치한다

- **관찰**: PRD "기술 스택"에 Next.js 16.3.8, React 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3, shadcn CLI 4.21.1, ESLint 9.39.5.
- **근거**: ✅ [FACT] Step 0의 `node_modules/*/package.json` 확인 결과와 모두 동일.
- **결론**: 불일치 없음. Critical Issue 없음.

#### 주장 #2: `@notionhq/client` 5.x로 소품 전체를 생성 시각 역순으로 가져올 수 있다

- **관찰**: PRD F001 "Notion 데이터베이스의 소품 전체(이름·상품 링크·종류·이미지 URL)를 가져와 … 순서는 Notion 생성 시각 역순", 기술 스택 "5 버전부터 데이터베이스 → 데이터 소스 단계가 생겨 조회 방법이 바뀌었으므로 설치 전 공식 문서를 확인한다".
- **근거**: ✅ [FACT] `notion.dataSources.query({ data_source_id, sorts: [{ timestamp: "created_time", direction: "descending" }] })` 형태가 공식 레퍼런스에 있다 (query-a-data-source). ⚠️ [FACT] 조회 키는 **데이터 소스 ID**이며 데이터베이스 ID와 호환되지 않는다 (업그레이드 가이드). [FACT] 응답 최대 100행, SDK가 `collectAllDataSourceRows` 헬퍼 제공.
- **결론**: 기능은 지원된다. 다만 PRD/기획 문서가 "데이터베이스 ID"만 언급하므로 데이터 소스 ID 확보 절차를 PRD에 명시해야 한다 (Major #1). 100행 초과를 대비해 헬퍼 또는 커서 반복을 쓰면 "전체"가 보장된다.
- **주장 간 영향**: 데이터 소스 ID를 환경변수로 두면 주장 #6(비밀 키 서버 전용)과 같은 방식으로 관리된다.

#### 주장 #3: 제목·URL·선택 속성을 읽어 `Item{id,name,url,imageUrl,category}`로 바꿀 수 있다

- **관찰**: PRD 데이터 모델 "이름(제목)·상품 링크(URL, 비면 이동 없음)·종류(Select, 비면 '기타')·이미지 URL(외부 주소, 선택)".
- **근거**: ✅ [FACT] `title` → rich text 배열(`plain_text`), `url` → 문자열|`null`, `select` → `{name}`|`null` (page-property-values). [FACT] URL 속성 2000자 제한 (request-limits). [ASSUMPTION] "이미지 URL" 열은 기획 문서 4장대로 **URL 속성**이다(Files 속성이 아니다).
- **결론**: `null` 처리를 PRD가 이미 요구하므로(F004) 데이터 모델과 API 응답 형태가 맞는다. [INFERENCE] URL 속성을 쓰는 한 Notion 호스팅 파일의 1시간 만료 문제는 구조적으로 발생하지 않는다.

#### 주장 #4: Notion에서 행을 지우거나 보관하면 웹에서 사라진다

- **관찰**: PRD 데이터 모델 "웹에서 빼고 싶은 소품은 Notion에서 행을 지우거나 보관(archive)한다".
- **근거**: ✅ [FACT] 필터 없이 조회하면 보관되지 않은 페이지만 반환, `is_archived` 생략/false가 기본 (query-a-data-source). ⚠️ [UNCERTAIN] 휴지통(in_trash)에 넣은 행이 기본 조회에서 빠지는지는 같은 문서에서 "`in_trash`는 이 엔드포인트의 요청 파라미터가 아니다"라고만 하고 응답 포함 여부를 명시하지 않았다.
- **결론**: "보관"은 확인됨. "삭제(휴지통)"는 샘플 데이터로 1회 실제 확인이 필요하다. 실패 시 대응은 Step 2.5.

#### 주장 #5: Next.js 16.3.8에서 "약 5분 ISR"을 구현할 수 있다

- **관찰**: PRD F010 "페이지를 미리 만들어 두고 약 5분이 지나면 다음 방문 때 뒤에서 Notion을 다시 읽어 새로 만든다(ISR)".
- **근거**: ✅ [FACT] `cacheComponents`가 꺼져 있으므로 구 모델이 적용되고, `export const revalidate = 300`을 `page.tsx`에 두면 된다 (caching-without-cache-components.md). [FACT] 새 모델 문서(`cacheLife('minutes')` 등)는 플래그가 켜져야 적용된다. [FACT] 개발 모드에서는 캐시가 동작하지 않는다. [FACT] Vercel은 모든 플랜에서 ISR을 지원하고, 재생성 실패 시 이전 캐시를 내보낸다.
- **결론**: 구현 가능. 단 PRD 기술 스택 문구 "이 버전의 사용법은 `node_modules/next/dist/docs/` 문서를 기준으로 한다"만으로는 두 모델 중 어느 쪽인지 정해지지 않아, 구현자가 새 모델 문서를 먼저 읽으면 `cacheLife`를 쓰려다 막힌다. "구 모델, `revalidate = 300` 리터럴" 또는 "`cacheComponents: true`로 전환"을 PRD가 결정해야 한다 (Major #2).
- **주장 간 영향**: 주장 #7(오류 화면)과 결합하면, 프로덕션에서 재생성 실패는 오류 화면이 아니라 "이전 내용 유지"로 나타난다.

#### 주장 #6: 비밀 키가 클라이언트에 노출되지 않는 구조다

- **관찰**: PRD 사용자 여정 "서버가 Notion에서 소품 전체를 읽어", F003 "브라우저 안에서만 동작"(필터).
- **근거**: ✅ [FACT] `NEXT_PUBLIC_` 접두사 없는 환경변수는 서버 전용 (environment-variables.md). [INFERENCE] 서버 컴포넌트가 Notion을 읽고 `Item[]`만 클라이언트 컴포넌트 props로 넘기면 API 키·데이터 소스 ID는 번들에 들어가지 않는다.
- **결론**: 구조적으로 안전하다. 나중에 보안을 강화할 때 걸림돌이 되는 선택이 없다.

#### 주장 #7: Notion 실패 시 기존 `error.tsx`("다시 시도")로 복구할 수 있다

- **관찰**: PRD F011 "Notion 읽기에 실패하면 공용 오류 화면('다시 시도' 버튼)을 보여주고, 버튼을 누르면 다시 불러온다", 가정 "저장소에 이미 있는 공용 오류 화면을 그대로 쓴다".
- **근거**: ✅ [FACT] `app/error.tsx`는 `(marketing)/layout.tsx`와 `page.tsx`를 감싼다(루트 layout 제외). `retry()`가 세그먼트를 다시 가져와 다시 그린다 (error.md). [FACT] 저장소 `error.tsx`가 이미 그 규약을 따른다. [INFERENCE] 페이지가 Notion 오류를 throw하면 머리글·바닥글까지 오류 화면으로 바뀐다(루트 `error.tsx`가 marketing layout을 감싸므로). [UNCERTAIN] 정적 페이지(`revalidate = 300`)의 **빌드 시** Notion 호출이 실패하면 `next build`가 실패하는지 — 설치 문서의 빌드 실패 예시는 Cache Components 기준이어서 구 모델에서의 동작은 확정하지 못했다.
- **결론**: 기능은 성립한다. 두 가지를 PRD에 적어 두면 좋다: (1) 프로덕션(Vercel)에서는 재생성 실패 시 이전 캐시가 나가므로 오류 화면은 "첫 빌드/첫 렌더 실패"와 개발 환경에서 보인다, (2) 빌드 시점 실패 가능성 (Major #2 안에서 함께 다룬다).

#### 주장 #8: `robots noindex` 메타를 설정할 수 있다

- **관찰**: PRD F012 "검색 엔진 색인 거부(robots noindex)를 설정한다", 관련 페이지 "소품 목록 페이지".
- **근거**: ✅ [FACT] `Metadata.robots: { index, follow, ... }` → `<meta name="robots">` (generate-metadata.md). [FACT] 중첩 필드는 뒤 세그먼트가 덮어쓴다. [FACT] 저장소에는 `/dashboard` 경로와 `not-found.tsx`가 존재한다.
- **결론**: 기능은 지원된다. [INFERENCE] 소품 목록 `page.tsx`에만 설정하면 `/dashboard` 등 다른 경로는 색인 거부가 안 걸린다. 루트 `app/layout.tsx`의 `metadata`에 두는 쪽이 "주소를 아는 사람만 본다"는 요구에 맞는다 (Major #3).

#### 주장 #9: `next/image`는 쇼핑몰 도메인마다 허용 목록이 필요해 `<img>`를 쓴다

- **관찰**: PRD 이미지 섹션.
- **근거**: ✅ [FACT] 외부 URL은 `remotePatterns`에 등록해야 한다 (image.md L71). [FACT] `**.example.com` 서브도메인 와일드카드는 지원. [UNCERTAIN] 호스트 전체를 `'**'`로 허용할 수 있는지는 문서 예시에 없다. [FACT] `<img>` 사용 시 `@next/next/no-img-element`가 `warn`으로 보고된다.
- **결론**: PRD의 판단은 타당하다. `npm run lint`에 경고 1건이 남으므로 처리 방침(주석으로 끄기 또는 경고 허용)을 정하면 된다 (Minor #1).

#### 주장 #10: Vercel 무료 플랜에서 ISR이 된다

- **관찰**: PRD 배포 "Vercel (무료 플랜, 다음 단계에 예정) — Next.js 호스팅과 ISR 지원".
- **근거**: ✅ [FACT] "available on all plans" (Vercel ISR 문서).
- **결론**: 일치.

### Step 2.5: 대안 탐색

❌는 없고 ⚠️ 두 건(데이터 소스 ID, 휴지통 행 처리)과 미결 한 건(ISR 모델 선택)에 대해서만 적는다.

#### ⚠️ 데이터 소스 ID 필요

1. **직접적 대안**: Notion 앱 "Manage data sources → Copy data source ID"로 복사해 `NOTION_DATA_SOURCE_ID` 환경변수에 넣는다. 코드 한 줄도 늘지 않는다.
2. **우회적 해결**: `NOTION_DATABASE_ID`를 유지하고 서버 시작 시 `databases.retrieve`로 `data_sources[0].id`를 한 번 구해 쓴다. 호출 1회가 늘고 "데이터 소스가 2개 이상일 때 어느 것을 쓰나"라는 분기가 생긴다.
3. **단계적 구현**: 1번으로 시작하고, 데이터 소스가 여럿이 될 일이 생기면 2번으로 바꾼다.
4. **아키텍처 조정**: 불필요.
5. **균형 평가**: 문제는 "ID 종류의 혼동"이지 기능 부재가 아니다. **권장**: 1번. PRD 데이터 모델 또는 기술 스택에 "조회 키는 데이터 소스 ID"라고 한 줄 적는다.

#### ⚠️ 휴지통(삭제) 행이 조회에서 빠지는지 미확인

1. **직접적 대안**: 샘플 데이터로 행 하나를 삭제한 뒤 조회해 본다(기획 문서 7장 2단계 "임시로 목록을 글자로 찍어 본다"에 포함).
2. **우회적 해결**: 삭제 대신 "보관"만 쓰기로 운영 규칙을 정한다(보관은 확인됨).
3. **단계적 구현**: 응답 객체의 `in_trash`/`archived` 필드를 변환 단계에서 걸러 낸다(응답에 포함되어 온다면).
4. **아키텍처 조정**: 불필요.
5. **균형 평가**: 어느 쪽이든 1인 개발자가 5분 안에 확정할 수 있는 항목. **권장**: 1번 확인 후 필요 시 3번.

#### 미결: ISR 구현 모델

1. **직접적 대안(A)**: 현재 설정 유지 + `page.tsx`에 `export const revalidate = 300`. 변경 범위 최소.
2. **대안(B)**: `next.config.ts`에 `cacheComponents: true`를 켜고 Notion 읽기 함수에 `'use cache'` + `cacheLife({ revalidate: 300 })`. Next.js 16의 권장 방향이지만 PPR·Activity 등 동작이 함께 바뀌고 기존 대시보드 틀까지 영향을 받을 수 있다.
3. **단계적 구현**: A로 MVP를 끝내고, 이후 단계에서 B로 전환을 검토.
4. **아키텍처 조정**: B가 곧 아키텍처 조정이다.
5. **균형 평가**: MVP 범위에서는 **A 권장**. 다만 PRD에 어느 쪽인지 명시해야 구현자가 새 모델 문서를 보고 헤매지 않는다.

### Step 3: 논리적 일관성

- **데이터 플로우**
  - 관찰: 방문 → 서버가 Notion 조회(ISR 캐시) → `Item[]`을 클라이언트 컴포넌트에 전달 → 칩 상태로 필터 → 카드 클릭 시 `<a target="_blank">`.
  - 근거: [FACT] 서버 컴포넌트에서 비동기 데이터 읽기와 `error.tsx` 경계(error-handling.md), [FACT] 서버 전용 환경변수(environment-variables.md), [FACT] 기존 `externalLinkProps`가 `target="_blank" rel="noopener noreferrer"` 패턴을 이미 쓴다 (`src/lib/site.ts` L86-90).
  - 결론: 각 단계에 필요한 기술이 모두 확인됐고 충돌 지점은 없다. [INFERENCE] 필터를 클라이언트에서 처리하므로 주소가 바뀌지 않고 ISR 캐시도 유지된다는 PRD의 설계 의도가 기술적으로 성립한다.
- **PRD 내부 정합성** (기능 ID ↔ 페이지 ↔ 메뉴 ↔ 데이터 모델)
  - 관찰: F001·F002·F003·F004·F010·F011·F012 7개가 메뉴 구조와 페이지별 상세 기능의 "구현 기능" 목록에 모두 나타난다. 데이터 모델 `Item`의 5개 필드가 F001(이미지·이름·종류), F002(url), F003(category), F004(빈 값 처리)를 전부 담는다. F010~F012는 데이터가 필요 없는 설정 기능이다.
  - 근거: PRD "기능 명세", "메뉴 구조", "페이지별 상세 기능", "데이터 모델" 섹션 대조.
  - 결론: 내부 정합성은 완결. 다만 두 가지 외부 불일치가 있다 — [FACT] `site.ts`의 메뉴 3개 vs PRD "홈 하나", [FACT] 기획 문서의 사이트 이름 "Living Wishlist" vs PRD 가정 "미정".
- **사용자 여정 vs 구현**
  - 관찰: 여정 1번 "[Notion 연결 실패] → 오류 상태 표시 → 다시 시도 → 1번으로".
  - 근거: [FACT] `retry()`가 세그먼트를 다시 가져온다 (error.md). [FACT] Vercel은 재생성 실패 시 이전 캐시를 내보낸다. [INFERENCE] 따라서 배포본에서 이 분기는 캐시가 아직 없을 때(첫 빌드/첫 요청) 또는 개발 환경에서만 보인다.
  - 결론: 여정은 구현 가능하며 과장이 없다. "약 5분 뒤 방문 시 자동 반영"(여정 4번)은 개발 서버에서는 재현되지 않으므로 검증 절차에 `build + start`를 적어 두는 것이 좋다.
- **해결 방안**: Major #1~#4 참고.

### Step 4: 복잡도 평가

- **기본 기능 구현**: **하** — 카드·배지·빈 상태 부품이 설치돼 있고(Step 0), 그리드·칩·새 탭 링크는 Tailwind 클래스와 `useState` 하나로 끝난다. 폼·인증·라우팅 분기가 없다.
- **API 통합**: **중** — Notion API 문서는 상세하고 SDK가 페이지네이션 헬퍼를 제공하지만, 데이터 소스 개념(ID 종류), 통합 공유 설정(403/404), 100행 단위 페이지네이션, 두 캐시 모델 중 선택이라는 "처음 한 번 짚어야 하는" 지점이 넷이다.
- **기술 선택이 보안에 미치는 영향**: **하** — 비밀 키는 서버 전용 환경변수, 클라이언트는 `Item[]`만 받는다. 로그인 없음은 요구사항이고, noindex는 구조적으로 가능하다. 나중에 접근 제한(예: 비밀번호)을 붙이려 해도 막는 선택이 없다.
- **누적 복잡도**: **하~중** — "상"이 하나도 없다. 대부분의 위험이 "문서를 한 번 정확히 읽는 일"로 해소된다.
- **1인 개발자 적합성**: 가장 복잡한 기능은 **F010(ISR) + F011(오류 화면)의 상호작용**이다. 둘 다 MVP에 꼭 필요하다(수동 재배포 없이 반영, 실패 시 복구 수단). 범위 축소 권장 없음.

### Step 5: 종합

- **예상 vs 결과**: Step 1에서 짚은 두 도전(데이터 소스 개념, 캐시 모델 선택)이 그대로 Major Issue로 확인됐다. 예상하지 못한 발견은 (1) `/dashboard` 경로 존속으로 noindex 적용 범위가 벌어질 수 있는 점, (2) 기준 기획 문서가 이미 사이트 이름을 정했는데 PRD가 미정으로 가정한 점, (3) 개발 서버에서는 ISR 검증이 불가능한 점.
- **긍정적 요소**: 스택 버전 전부 일치. 기존 `error.tsx`가 16.3.8 규약을 이미 따른다. Notion API가 모든 요구를 제공하고 요청 한도 대비 사용량이 극히 적다. 비밀 키가 구조적으로 서버에만 머문다. PRD가 Notion 호스팅 이미지의 1시간 만료, `next/image` 허용 목록 등 실제 제약을 정확히 반영했다.
- **부정적 요소**: 데이터 소스 ID와 ISR 모델이 PRD 문장에 미결로 남아 있어 구현자가 다른 문서를 보고 돌아올 수 있다. noindex가 페이지 단위로만 지정돼 있다.
- **중립적 고려 사항**: `<img>`의 lint 경고(`warn`)는 빌드를 막지 않는다. 휴지통 행 처리와 빌드 시 Notion 실패 동작은 샘플 데이터로 바로 확인 가능하다.
- **종합 결론**: 이 PRD는 기술적으로 실현 가능하며 근본적 오류가 없다. Major 4건은 모두 "PRD 문장에 한두 줄을 더 적는" 수준이고 아키텍처 변경을 요구하지 않는다. 수정 후 바로 구현 단계로 넘어갈 수 있다.

## 🔴 Critical Issues (즉시 수정 필요)

없음. [FACT] 기술 스택 버전은 설치 상태와 전부 일치하고, 필요한 외부 API 기능은 모두 공식 문서로 확인됐다.

## 🟡 Major Issues (개발 전 개선 권장)

### Issue #1: 조회 키는 "데이터베이스 ID"가 아니라 "데이터 소스 ID"다

- **관찰**: PRD 기술 스택 "5 버전부터 '데이터베이스 → 데이터 소스' 단계가 생겨 조회 방법이 바뀌었으므로 설치 전 공식 문서를 확인한다"로 미결 상태. 기준 기획 문서 3장은 환경변수를 `NOTION_DATABASE_ID`로 적었다.
- **근거**: [FACT] `notion.dataSources.query({ data_source_id })`가 조회 방법이며 "Database IDs and data source IDs are not interchangeable" (`https://developers.notion.com/docs/upgrade-guide-2025-09-03`, SDK README).
- **결론**: 데이터베이스 ID를 그대로 넣으면 조회가 실패한다. 기능 부재는 아니고 ID 종류 혼동이므로 영향은 "첫 연동 시 막힘" 정도다.
- **개선 제안**: [INFERENCE] PRD 데이터 모델 또는 기술 스택에 "조회에는 Notion 앱 '데이터 소스 관리 → 데이터 소스 ID 복사'로 얻은 **데이터 소스 ID**를 쓴다(환경변수 `NOTION_DATA_SOURCE_ID`)"를 적고, 기획 문서 3장·7장 1단계도 같이 고친다. 100행 초과를 대비해 `collectAllDataSourceRows`(또는 `next_cursor` 반복) 사용을 명시한다.
- **대안 기술**: [ALTERNATIVE] `databases.retrieve` → `data_sources[0].id`로 런타임에 구하는 방법(호출 1회 추가).

### Issue #2: ISR 구현 모델을 PRD가 정하지 않았다 (구 모델 vs Cache Components)

- **관찰**: PRD F010 "ISR … 약 5분", 기술 스택 "이 버전의 사용법은 `node_modules/next/dist/docs/` 문서를 기준으로 한다".
- **근거**: [FACT] `next.config.ts`에 `cacheComponents`가 없다. [FACT] 설치 문서의 "Revalidating" 시작 가이드(`cacheLife`)는 플래그가 켜진 경우용이고, 꺼진 경우는 별도 가이드의 `export const revalidate = <정적 숫자>`를 쓴다. [FACT] 개발 모드에서는 캐시가 동작하지 않는다. [FACT] Vercel은 재생성 실패 시 이전 캐시를 유지한다.
- **결론**: 구현자가 시작 가이드부터 읽으면 `cacheLife`를 쓰려다 "플래그 필요" 벽에 부딪힌다. 또 기획 문서 7장 4단계의 확인 방법("Notion에서 이름을 고친 뒤 5분 후 반영")은 `next dev`로는 재현되지 않는다.
- **개선 제안**: [INFERENCE] F010 설명에 "`cacheComponents`는 켜지 않는다. `app/(marketing)/page.tsx`에 `export const revalidate = 300`(리터럴)을 둔다. 확인은 `npm run build && npm run start`로 한다"를 추가. F011에 "배포본에서 재생성이 실패하면 이전 내용이 유지되고 오류 화면은 캐시가 없는 첫 렌더 때 보인다"를 한 줄 추가. [UNCERTAIN] 빌드 시점에 Notion이 실패하면 `next build`가 실패할 가능성이 있으므로, 배포 전 Vercel 환경변수 등록을 선행 조건으로 적어 두면 좋다.
- **대안 기술**: [ALTERNATIVE] `cacheComponents: true` + `'use cache'` + `cacheLife({ revalidate: 300 })`. MVP 이후 검토 권장.

### Issue #3: 색인 거부(F012)의 적용 위치와 남는 경로

- **관찰**: F012의 관련 페이지가 "소품 목록 페이지"로만 지정. PRD 메뉴 구조는 "홈 하나", "대시보드 틀은 쓰지 않는다".
- **근거**: [FACT] `src/app/(dashboard)/dashboard/page.tsx`가 존재하고 `src/lib/site.ts`의 `mainNav`에 "대시보드·컴포넌트 둘러보기" 항목이 남아 있다. [FACT] `Metadata.robots`는 뒤 세그먼트가 덮어쓰는 중첩 필드다 (generate-metadata.md L1348).
- **결론**: [INFERENCE] 소품 목록 `page.tsx`에만 `robots`를 두면 `/dashboard`와 404 화면은 색인 거부가 안 걸린다. 메뉴만 숨겨도 주소는 살아 있다.
- **개선 제안**: [INFERENCE] F012의 적용 위치를 "루트 `app/layout.tsx`의 `metadata.robots = { index: false, follow: false }`"로 바꿔 모든 경로를 덮는다. 메뉴 구조 섹션에 "`lib/site.ts`의 `mainNav`를 '홈' 하나로 줄이고, `(dashboard)` 경로는 삭제 또는 유지(색인 거부는 루트에서 걸림)"를 명시한다.
- **대안 기술**: [ALTERNATIVE] `app/robots.ts`(파일 기반 `robots.txt`)를 추가로 두어 크롤러 접근 자체를 거부. 메타 태그와 병행 가능.

### Issue #4: 사이트 이름 — 기준 기획 문서와 불일치

- **관찰**: PRD 가정 "기획 문서에 '아직 정하지 않은 것'으로 남아 있어 … '인테리어 소품 후보 모아보기'로 가정".
- **근거**: [FACT] 기획 문서 10장 "사이트 이름: **Living Wishlist** (2026-10-09 결정). Notion 데이터베이스 이름도 같게 함", 진행 상태에도 "이름 `Living Wishlist`" (`plans/2026-10-09-project-notion-cms-interior-service-plan.md` L109, L114).
- **결론**: PRD가 기준 문서의 결정 사항을 반영하지 못했다. 기술 위험은 없지만 `lib/site.ts`에 들어갈 값이 달라진다.
- **개선 제안**: 가정 섹션의 해당 항목을 삭제하고 핵심 정보·메뉴 구조의 이름을 "Living Wishlist"로 바꾼다. 화면 문구는 한국어 규칙(프로젝트 CLAUDE.md)이 있으므로 영어 이름 사용 여부를 한 줄로 확정한다.
- **대안 기술**: 해당 없음.

## 🟢 Minor Suggestions (선택적 개선)

### Suggestion #1: `<img>` lint 경고 처리 방침

- **개선 기회**: [FACT] `@next/next/no-img-element`가 `warn`이라 `npm run lint`에 경고가 남는다. 기획 문서 7장 5단계는 "lint·build 오류 0"을 목표로 한다(경고는 오류가 아니다).
- **예상 효과**: 카드 컴포넌트의 `<img>` 위에 `{/* eslint-disable-next-line @next/next/no-img-element */}` 주석 한 줄(이유 포함)을 두면 경고 없는 lint 결과를 유지할 수 있다.
- **구현 복잡도**: 하
- **우선순위**: 낮음

### Suggestion #2: 오류 화면에서 머리글·바닥글 유지

- **개선 기회**: [FACT] 루트 `app/error.tsx`는 `(marketing)/layout.tsx`까지 감싸므로 오류 시 머리글이 사라진다. `app/(marketing)/error.tsx`를 두면 같은 세그먼트의 layout은 감싸지 않아 머리글·바닥글이 남는다 (error.md L96).
- **예상 효과**: 오류 상태에서도 사이트 이름과 홈 링크가 보인다. 기존 `error.tsx`를 거의 그대로 복사(단, `<main>`은 틀이 그리므로 빼야 함 — 프로젝트 CLAUDE.md 규칙).
- **구현 복잡도**: 하
- **우선순위**: 낮음 (PRD의 "공용 오류 화면 그대로" 가정으로도 충분)

### Suggestion #3: 종류 칩을 스키마에서 읽는 선택지

- **개선 기회**: [ALTERNATIVE] `GET /v1/data_sources/:id`가 `properties`(선택지 목록)를 돌려주므로 소품이 0개인 종류도 칩으로 보일 수 있다. PRD 가정 "소품이 하나도 없는 종류는 칩에 나오지 않는다"는 MVP에서 합리적이다.
- **예상 효과**: 칩 순서를 Notion 선택지 순서로 고정할 수 있다. 호출 1회와 변환 코드가 늘어난다.
- **구현 복잡도**: 중
- **우선순위**: 낮음 (MVP 이후)

### Suggestion #4: 삭제(휴지통) 행 동작 1회 확인

- **개선 기회**: [UNCERTAIN] 휴지통 행이 기본 조회에서 빠지는지 미확인. 기획 문서 7장 1단계 샘플 입력 때 행 하나를 삭제해 조회 결과를 보면 확정된다.
- **예상 효과**: "지우거나 보관한다"는 운영 규칙이 그대로 유효한지 확인.
- **구현 복잡도**: 하
- **우선순위**: 중 (연동 코드 작성 직후)

## 🏁 최종 검증 판정

### 판정 요약

1. **확인된 사실**: 스택 버전 전부 일치 · `@notionhq/client` 5.27.0이 최신이고 `dataSources.query` + `created_time` 역순 정렬 + 제목·URL·선택 속성 읽기 제공 · 보관 행 기본 제외 · 요청 한도 180회/분 · Next.js 16.3.8 구 캐시 모델에서 `revalidate = 300` 가능 · `error.tsx`의 `retry` 규약 일치 · `Metadata.robots` 지원 · 서버 전용 환경변수 · Vercel ISR 전 플랜 지원.
2. **일관성**: 기능 ID ↔ 페이지 ↔ 메뉴 ↔ 데이터 모델 완결. 저장소(`site.ts` 메뉴, `/dashboard`)와 기준 기획 문서(사이트 이름)와의 차이 3곳.
3. **제약**: 데이터 소스 ID 필요 · 100행 페이지네이션 · 개발 서버에서 ISR 미동작 · `<img>` lint 경고 · 휴지통 행 처리 미확인.
4. **따라서**: 아키텍처 변경 없이 PRD 문장 보완만으로 구현 가능.

### 기술적 판정 (세분화)

- **✅ 검증 완료**: PRD 그대로 구현 가능, 수정 최소
- **⚠️ 조건부 통과**: 수정 후 구현 가능, 기술적으로 실현 가능
- **🔄 대규모 수정 필요**: 아키텍처 재설계 필요하나 목표 달성 가능
- **⛔ 부분 구현 가능**: 일부 기능만 구현 가능, 범위 축소 필요
- **❌ 재검토 필요**: 근본적 오류, 전면 재작성 필요

**선택된 판정**: **⚠️ 조건부 통과**

**판정 근거:**

1. [FACT] 기술적 사실: 요구 기능 전부가 공식 문서·설치 코드로 확인됐고 버전 불일치가 없다.
2. [INFERENCE] 판단: Major 4건은 모두 "어떤 ID를 쓰나 / 어떤 캐시 모델이냐 / 메타를 어디 두나 / 이름이 뭐냐"라는 **문서 명시 문제**이며, 어느 것도 설계를 바꾸지 않는다.
3. [UNCERTAIN] 불확실 요소: 휴지통 행의 기본 조회 포함 여부, 구 모델에서 빌드 시 Notion 실패의 `next build` 영향, `remotePatterns`의 전체 호스트 와일드카드 가능 여부, Notion-Version `2026-03-11`의 `archived → in_trash` 변경이 `is_archived` 파라미터에 주는 영향, Notion Web Clipper의 대상 데이터베이스 지정 가능 여부(MVP 이후), SDK 내부 fetch와 Next.js fetch 캐시의 상호작용(라우트 단위 `revalidate`를 쓰면 무관).
4. **따라서** Major #1~#4를 PRD에 반영한 뒤 기획 문서 7장 순서대로 구현을 시작하는 것을 권장한다. Critical Issue는 없다.

### 신뢰도 및 위험도

- **기술적 신뢰도**: 8/10 — 핵심 주장 10개 중 10개가 [FACT]로 확인됐고, 남은 [UNCERTAIN] 6건은 모두 MVP 성패가 아닌 세부 동작이다. WebFetch 요약에 의존한 Notion 문서 일부(README 헬퍼 이름 등)는 원문 재확인 1회를 거쳤다.
- **구현 복잡도**: 3/10 — Step 4 집계 "하·중·하", "상" 0건. 화면 1개, 외부 라이브러리 1개 추가.
- **외부 의존 위험**: 4/10 — 외부 API는 Notion 1개(요청 한도 여유 큼, 문서 상세)이지만, 이미지는 불특정 쇼핑몰 호스트에 의존해 깨짐이 잦을 수 있다(PRD가 대체 그림으로 이미 대응).
- **전체 위험도**: 3/10 — 위 세 가지를 종합하면 "문서 보완 후 바로 진행 가능한 저위험 MVP".

### 추가 검증이 필요한 영역

- **[UNCERTAIN]** 휴지통(삭제) 행이 `dataSources.query` 기본 응답에서 빠지는지 — 샘플 데이터로 확인
- **[UNCERTAIN]** 구 캐시 모델에서 빌드 시 Notion 호출 실패가 `next build`를 실패시키는지 — 환경변수 없이 `npm run build`를 한 번 돌려 확인
- **[UNCERTAIN]** `remotePatterns`의 `hostname: '**'` 허용 여부 — `<img>`를 쓰는 한 MVP와 무관
- **[UNCERTAIN]** Notion-Version `2026-03-11` 전환 시 `is_archived` 파라미터 변화 — 기본값 `2025-09-03`을 유지하면 무관
- **[UNCERTAIN]** Notion Web Clipper 대상 데이터베이스 지정 — PRD가 MVP 이후로 둠
- **[UNCERTAIN]** SDK 내부 fetch와 Next.js fetch 캐시 상호작용 — 라우트 단위 `revalidate`를 쓰면 무관

### 개발 진행 권장사항

1. **즉시 해결**: Critical 없음. Major #1(데이터 소스 ID)·#2(ISR 모델 명시)를 PRD와 기획 문서 3장·7장에 반영.
2. **개발 전 확인**: Major #3(noindex를 루트 레이아웃에, `site.ts` 메뉴 정리, `/dashboard` 처리 결정)·#4(사이트 이름 "Living Wishlist"). Notion 통합 생성 시 read content 권한과 데이터베이스 공유를 확인(403/404 원인).
3. **개발 중 고려**: Minor #1(`<img>` lint 주석), #2(`(marketing)/error.tsx`), #4(휴지통 행 확인). ISR 확인은 `npm run build && npm run start`.
4. **지속적 검토**: `@notionhq/client`의 `Notion-Version` 기본값 변경(현재 `2025-09-03`)과 Next.js의 `cacheComponents` 기본화 여부. 버전을 올릴 때는 `.claude/rules/library-docs.md` 절차대로 릴리스 노트를 먼저 읽는다.
