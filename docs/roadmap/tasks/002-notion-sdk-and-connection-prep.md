# Task 002: Notion SDK 설치와 연결 준비하기

담당 기능: 기반 (전 기능 공통), F011 · Phase 1 · 상태: 완료

## 목표

가장 불확실한 외부 연동(Notion SDK 5.x 호출 방식·데이터 소스 ID·열 타입)을 화면보다 먼저 확인한다. `@notionhq/client` 5.x를 설치하고, `.env.local`에 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID`를 두고, `src/lib/notion.ts`에 Notion 클라이언트와 `fetchAllRows()`(전체 행 수집, 최근 추가가 위)를 만든다. 환경변수가 없으면 한국어 메시지로 오류를 던져 F011(Notion 연결 오류 표시)의 실패 원인이 드러나게 한다. 이 Task가 끝나면 터미널에서 Notion 표의 행 개수가 찍히고, 화면(`page.tsx`)은 아직 더미 데이터 그대로다. 열 이름 ↔ `Item` 매핑과 화면 연결은 Task 006이 한다.

PRD 근거: 데이터 모델 "조회 키"(데이터 소스 ID, `.env.local`, 전체 행 수집 방식), 기술 스택 "@notionhq/client 5.x (설치 예정)", F011("API 키·데이터 소스 ID 오류" 시 복구 수단).

## 관련 파일

- 새로 만들 파일:
  - `src/lib/notion.ts` (Notion 클라이언트 생성, 환경변수 검사, `fetchAllRows()`)
  - `.env.local` (`NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`. git 미추적 — `.gitignore`의 `.env*` 규칙)
- 고칠 파일:
  - `README.md` (기술 스택 표에 `@notionhq/client` 버전 추가, 환경변수 절 추가)
  - `package.json`·`package-lock.json` (설치로 자동으로 바뀜. 손으로 고치지 않음)
- 참고할 기존 코드:
  - `src/lib/items.ts` — `Item` 타입과 `OTHER_CATEGORY`. **이번 Task에서는 쓰지 않는다** (SDK 응답 행을 그대로 반환하고, `Item`으로 바꾸는 매핑은 Task 006에서 같은 파일 `src/lib/notion.ts`에 추가한다)
  - `.gitignore` — `.env*` 규칙이 이미 있어 `.env.local`이 git에 올라가지 않음
- 읽을 규칙:
  - `.claude/rules/dependencies.md` — 설치·버전 변경 시 `README.md` 버전 표 함께 수정, `npm audit fix --force` 금지
  - `.claude/rules/library-docs.md` — 처음 쓰는 라이브러리는 기억이 아닌 설치된 코드(`node_modules/<패키지>/`의 `*.d.ts`·`README.md`)와 `homepage` 문서로 확인
  - `CLAUDE.md` "프로젝트 문서" — Notion SDK 5.x는 데이터베이스 ID가 아닌 **데이터 소스 ID**로 조회(`NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`)
  - `CLAUDE.md` "구조"·"코드 규칙" — `lib`은 최하층(위층 import 금지), kebab-case, named export, `any` 금지, 주석 한국어, 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)
  - `docs/prd/prd.md` "데이터 모델" 조회 키 절, "기술 스택" 데이터 저장소 절, F011 행

## 명세

- **사용자가 직접 할 일 (Notion 쪽 준비, 코드 밖)**: 아래는 Notion 화면에서 사용자가 직접 하고, 얻은 값은 채팅에 붙여 넣지 않고 `.env.local`에 바로 넣는다
  1. Notion 통합(Integration) 페이지에서 **내부 통합(internal integration)** 하나를 만든다 (이름 예: Living Wishlist)
  2. 만든 통합의 **API 키(Internal Integration Secret)** 를 발급받아 복사한다
  3. Notion의 소품 표(Living Wishlist 데이터베이스)를 열어 "연결(Connections)"에서 방금 만든 통합을 **연결**한다 (연결하지 않으면 키가 맞아도 조회가 실패한다)
  4. 같은 표에서 "**데이터 소스 관리 → 데이터 소스 ID 복사**"로 **데이터 소스 ID**를 복사한다. 주소창에 보이는 데이터베이스 ID와는 다른 값이며, 섞어 쓰면 SDK 5.x에서 조회가 실패한다
  5. 두 값을 `.env.local`에 `NOTION_API_KEY=...`, `NOTION_DATA_SOURCE_ID=...` 형태로 **직접 붙여 넣는다**. 키는 채팅·커밋·스크린샷에 남기지 않는다
- **SDK 설치**: `.claude/rules/dependencies.md`·`.claude/rules/library-docs.md`를 먼저 읽는다. `npm view @notionhq/client version`으로 현재 버전을 확인한 뒤 `@notionhq/client` **5.x**를 설치한다 (PRD 기획 기준 5.27.0, 실제 최신 5.x로 재확인). 설치 후 `node_modules/@notionhq/client`의 `*.d.ts`에서 `dataSources.query`의 매개변수·응답 타입과 전체 행 수집 도우미 이름(`collectPaginatedAPI` 등. PRD는 `collectAllDataSourceRows`로 적었으나 실제 이름은 설치된 코드를 따른다)을 확인한다. `README.md` 기술 스택 표에 `@notionhq/client` 행(설치된 버전)을 추가한다
- **환경변수**: `.env.local`에 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID` 두 줄. `NOTION_DATA_SOURCE_ID`는 **데이터 소스 ID**이며 데이터베이스 ID와 섞지 않는다. `.gitignore`의 `.env*` 규칙으로 git에 추적되지 않는지 확인한다(`git status`에 `.env.local`이 보이지 않아야 함). `README.md`에 두 변수 이름과 얻는 방법("데이터 소스 관리 → 데이터 소스 ID 복사", 통합 연결 필요)을 설명하는 절("환경변수" 등) 하나를 추가한다. 값은 README에 적지 않는다
- **`src/lib/notion.ts` 1차**:
  - `@notionhq/client`의 `Client`로 Notion 클라이언트를 만든다. `process.env.NOTION_API_KEY`·`process.env.NOTION_DATA_SOURCE_ID`가 비어 있으면 **한국어 메시지**로 `Error`를 던진다 (예: "환경변수 NOTION_API_KEY가 없습니다. .env.local을 확인하세요"). 어느 변수가 빠졌는지 메시지에 이름을 넣어 F011 실패 원인이 바로 드러나게 한다
  - `fetchAllRows()` named export — `dataSources.query`에 데이터 소스 ID를 넘기고, 정렬은 `created_time` 내림차순(최근 추가가 위, PRD "(생성 시각) 역순"). 소품이 100개를 넘어도 전부 가져오도록 전체 행 수집(`next_cursor`를 따라 반복하거나 SDK 도우미 사용)
  - **열 이름 ↔ `Item` 매핑은 아직 넣지 않는다.** SDK 응답 행(페이지 객체)을 그대로 배열로 반환한다. 반환 타입은 SDK가 제공하는 타입을 쓰고 `any`는 금지한다 (타입 이름은 `*.d.ts`에서 확인)
  - 서버에서만 실행되는 파일이다 (`"use client"` 없음). `lib` 계층이므로 `components`·`app`을 import하지 않는다. 주석은 한국어, shadcn 스타일(큰따옴표, 세미콜론 없음)
- **`src/app/(marketing)/page.tsx`는 건드리지 않는다.** 화면은 Task 006까지 `mockItems`를 그대로 쓴다 (단, 완료 기준의 터미널 확인이 안 될 때만 임시 `console.log`를 넣었다가 반드시 제거한다)

## 구현 단계

- [x] 1. `.claude/rules/dependencies.md`·`.claude/rules/library-docs.md`를 읽고, `npm view @notionhq/client version`으로 버전 확인 후 `@notionhq/client` 5.x 설치. `node_modules/@notionhq/client`의 `*.d.ts`로 `dataSources.query` 매개변수·응답 타입과 전체 행 수집 도우미 이름 확인
- [x] 2. `.env.local` 틀 만들기 — `NOTION_API_KEY=`·`NOTION_DATA_SOURCE_ID=` 두 줄 (값은 사용자가 명세의 "사용자가 직접 할 일" 순서로 직접 넣음). `git status`로 `.env.local`이 미추적(`.gitignore`의 `.env*`)인지 확인
- [x] 3. `src/lib/notion.ts` 작성 — 환경변수 검사(없으면 한국어 오류), `Client` 생성, `fetchAllRows()`(데이터 소스 ID, `created_time` 내림차순, 전체 행 수집, 매핑 없이 SDK 응답 행 반환, `any` 금지)
- [x] 4. `README.md` 갱신 — 기술 스택 표에 `@notionhq/client` 행(설치된 버전) 추가, 환경변수 절(두 변수 이름 + "데이터 소스 관리 → 데이터 소스 ID 복사" + 통합 연결) 추가
- [x] 5. `npm run lint` → `npm run build` → 터미널에서 `fetchAllRows()` 행 개수 확인 → 환경변수 하나를 지워 한국어 오류 확인 후 `.env.local` 원복

## 완료 기준

- [x] `npm run lint` 통과
- [x] `npm run build` 통과
- [x] 터미널에서 행 개수 확인: `node --env-file=.env.local --input-type=module -e "import('./src/lib/notion.ts').then(m => m.fetchAllRows()).then(r => console.log(r.length))"` 실행 시 Notion 표의 행 개수(숫자)가 찍힘 (Node 24는 TS 파일을 바로 실행. 안 되면 `src/app/(marketing)/page.tsx`에 임시 `console.log(await fetchAllRows())`를 넣어 `npm run dev` 터미널에서 확인한 뒤 **반드시 제거**)
- [x] `.env.local`에서 환경변수 하나(예: `NOTION_DATA_SOURCE_ID`)를 지우고 같은 명령을 실행하면 `src/lib/notion.ts`의 한국어 오류 메시지(빠진 변수 이름 포함)가 찍힘. 확인 후 `.env.local` 원복
- [x] `git status`에 `.env.local`이 나타나지 않음, `src/app/(marketing)/page.tsx`에 변경 없음

## 변경 요약

- 설치: `@notionhq/client` 5.27.0 (`package.json`·`package-lock.json`)
- 새로 만든 파일: `src/lib/notion.ts` — `requireEnv()`(빠진 변수 이름을 넣은 한국어 오류, 함수 안에서만 호출해 환경변수 없이도 build 통과), `fetchAllRows()`(`collectPaginatedAPI` + `dataSources.query`, `created_time` 내림차순, `isFullPage`로 완전한 행만 반환). `.env.local`(git 미추적, 값은 사용자가 입력)
- 고친 파일: `README.md` — 기술 스택 표에 SDK 행, "환경변수" 절(얻는 순서·데이터 소스 ID 주의), 폴더 그림의 `features/`·`lib/` 줄 현행화
- 결정 사항: SDK 도우미 `collectAllDataSourceRows`는 정렬을 오름차순으로 고정해 쓰지 않고 `collectPaginatedAPI`에 정렬을 직접 넘김. PRD가 적은 도우미 이름(`collectAllDataSourceRows`)과 다름
- 확인: lint·build 통과. 터미널에서 `fetchAllRows()`가 7행 반환, 첫 행이 가장 최근 생성. 값이 비어 있을 때 "환경변수 NOTION_API_KEY가 없습니다. .env.local을 확인하세요" 출력. Node 24가 TS 파일을 바로 실행함(모듈 타입 경고만 나옴, `--no-warnings`로 숨길 수 있음)
- 검증된 가정: 실제 열은 `이름=title`, `상품 링크=url`, `종류=select`, `이미지 URL=url` — ROADMAP 가정 절의 "URL 속성" 가정이 맞음. Task 006 매핑은 이 타입 기준으로 작성
- 겪은 문제: 처음 넣은 ID가 데이터베이스 ID라 `object_not_found`(404)가 났음. `databases.retrieve`로 확인해 그 안의 `data_sources[0].id`를 데이터 소스 ID로 바꿔 해결. README 환경변수 절에 이 증상을 한 줄 추가함
- 남긴 일: 없음. 다음은 Task 003(기본 카드·그리드)
