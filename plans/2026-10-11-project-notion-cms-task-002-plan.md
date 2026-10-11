# Task 002 구현 계획: Notion SDK 설치와 연결 준비

## Context

명세는 `docs/roadmap/tasks/002-notion-sdk-and-connection-prep.md`에 있고 여기엔 다시 적지 않는다. 이 계획은 실제 수정 순서와 확인 방법만 적는다. 목표는 화면을 만들기 전에 Notion 연결(SDK 5.x 호출 방식·데이터 소스 ID·키)을 터미널에서 검증하는 것이다. `page.tsx`는 건드리지 않는다.

SDK는 프로젝트에 설치하기 전에 임시 폴더에 내려받아 타입 정의를 확인했다 (`@notionhq/client` 최신 5.27.0, 문서 `homepage` = developers.notion.com):

- `new Client({ auth })` — `auth?: string`
- `notion.dataSources.query({ data_source_id, sorts, start_cursor, page_size })` — `sorts`에 `{ timestamp: "created_time", direction: "descending" }` 가능. 응답 `results`는 `PageObjectResponse | PartialPageObjectResponse | PartialDataSourceObjectResponse | DataSourceObjectResponse` 배열, `next_cursor`·`has_more` 포함
- 전체 행 수집 도우미 `collectPaginatedAPI(listFn, firstPageArgs)` — `next_cursor`를 따라 끝까지 모아 배열로 반환. SDK의 `collectAllDataSourceRows`는 정렬을 `created_time` 오름차순으로 고정하므로 쓰지 않는다 (우리는 내림차순)
- 타입 가드 `isFullPage(row)` — 완전한 페이지 행(`PageObjectResponse`)만 거른다

## 수정 순서 (작업 파일 구현 단계 1~5와 같음)

1. **SDK 설치**: `npm install @notionhq/client@5` (규칙 파일은 읽음. 설치 뒤 `package.json`의 버전 확인, `npm audit fix --force` 금지). 설치된 `node_modules/@notionhq/client/build/src/helpers.d.ts`에서 위 이름이 같은지 한 번 더 확인
2. **`.env.local` 틀**: 아래 두 줄과 한국어 주석만. 값은 사용자가 직접 넣는다. `git status`에 안 보이는지 확인
   ```
   # Notion 통합의 API 키 (Internal Integration Secret)
   NOTION_API_KEY=
   # 소품 표의 데이터 소스 ID ("데이터 소스 관리 → 데이터 소스 ID 복사". 데이터베이스 ID 아님)
   NOTION_DATA_SOURCE_ID=
   ```
3. **`src/lib/notion.ts` 새로 만들기** (shadcn 스타일, 한국어 주석, `any` 없음):
   - `requireEnv(name)` — `process.env[name]`이 비면 `Error("환경변수 NOTION_API_KEY가 없습니다. .env.local을 확인하세요")`처럼 변수 이름을 넣어 던짐. **함수 안에서 호출**해 모듈을 import만 해도 오류가 나지 않게 한다 (환경변수 없이도 build 통과)
   - `fetchAllRows(): Promise<PageObjectResponse[]>` — `new Client({ auth })`, `collectPaginatedAPI(notion.dataSources.query, { data_source_id, sorts: [{ timestamp: "created_time", direction: "descending" }] })`, 결과를 `filter(isFullPage)`로 걸러 반환. 매핑 없음
4. **`README.md`**: 기술 스택 표에 `| @notionhq/client | 5.27.0 | Notion 데이터 소스 조회 (SDK 5.x, 데이터 소스 ID로 조회) |` 행 추가. "시작하기" 절 뒤에 `## 환경변수` 절 추가 — 두 변수 이름, 얻는 방법(내부 통합 만들기 → 키 복사 → 소품 표에 통합 연결 → "데이터 소스 관리 → 데이터 소스 ID 복사"), `.env.local`은 git에 안 올라감, 배포 시 Vercel 설정에 등록. 값은 적지 않음. 같은 김에 폴더 구조 그림의 낡은 줄 2곳도 현재 상태로 고침 (`features/ (아직 없음…)` → `wishlist/`, `lib/`에 `items.ts`·`mock-items.ts`·`notion.ts`)
5. **확인**: 아래 검증 절

## 검증

1. `npm run lint`, `npm run build` (환경변수 없어도 통과해야 함 — `requireEnv`가 함수 안에 있으므로)
2. 사용자가 `.env.local`에 값을 넣은 뒤:
   ```
   node --env-file=.env.local --input-type=module -e "import('./src/lib/notion.ts').then(m => m.fetchAllRows()).then(r => console.log(r.length))"
   ```
   숫자(행 개수)가 찍히면 성공. Node 24의 TS 직접 실행이 안 되면 `page.tsx`에 임시 `console.log` 후 제거
3. 같은 명령으로 환경변수 하나를 비운 상태(예: `NOTION_DATA_SOURCE_ID=`)에서 한국어 오류 메시지 확인 → 원복. 값을 지우는 대신 셸에서 `NOTION_DATA_SOURCE_ID= node --env-file=...`처럼 빈 값을 덮어써 확인하면 파일을 건드리지 않아도 된다 (덮어쓰기가 안 되면 파일에서 잠시 지운다)
4. `git status`에 `.env.local` 없음, `page.tsx` 변경 없음 확인
5. 작업 파일 체크박스·변경 요약, 계획 파일을 `plans/2026-10-11-project-notion-cms-task-002-plan.md`로 옮기고 완료 상태 추가, `development-planner`로 ROADMAP의 Task 002 완료 + Task 003 우선순위. 커밋은 `/ship`

## 사용자가 해야 할 것 (2단계 뒤)

Notion에서 내부 통합을 만들어 API 키를 받고, 소품 표에 그 통합을 연결한 뒤, "데이터 소스 관리 → 데이터 소스 ID 복사"로 ID를 얻어 `.env.local`에 직접 붙여 넣는다. 2번 검증은 그 뒤에 진행한다. 키는 채팅에 붙여 넣지 않는다.

## 범위 밖

- 열 이름 ↔ `Item` 매핑, `page.tsx` 연결, `mock-items.ts` 삭제 (Task 006)
- 오류 화면 동작 확인 (Task 007)

## 완료 상태 (2026-10-11)

- ✅ 1~4단계: SDK 5.27.0 설치, `.env.local` 틀, `src/lib/notion.ts`, README 갱신
- ✅ 5단계: lint·build 통과, 터미널에서 7행 확인(열 타입 `title`·`url`·`select`·`url`로 가정 검증), 빈 환경변수 오류 메시지 확인, `page.tsx` 변경 없음
- 겪은 문제: 사용자가 처음 넣은 값이 데이터베이스 ID → `object_not_found`. 데이터 소스 ID로 교체해 해결, README에 증상 한 줄 추가
- 작업 파일 `docs/roadmap/tasks/002-notion-sdk-and-connection-prep.md` 완료 상태. ROADMAP 갱신은 development-planner, 커밋은 `/ship`

## 남은 작업

- 없음. 다음은 "Task 003 작업 파일 만들어줘"
