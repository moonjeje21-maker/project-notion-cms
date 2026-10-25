# Task 006 구현 계획: Notion 소품을 Item으로 바꿔 화면에 연결

## Context

명세는 `docs/roadmap/tasks/006-notion-items-mapping.md`에 있고 여기엔 다시 적지 않는다. 이 계획은 실제 수정 순서와 확인 방법만 적는다.

Phase 2까지 화면은 더미 데이터 9개로 전부 동작한다. 이 Task는 Phase 3의 첫 Task로, `src/lib/notion.ts`에 "Notion 행 → `Item`" 매핑 `getItems()`를 넣고, 홈 페이지가 더미 대신 그 결과를 쓰게 한 뒤 더미 파일을 지운다. 끝나면 `/`에 사용자의 실제 Notion 소품이 보인다.

미리 확인한 사실(2026-10-25, 읽기 전용 조회):

- `.env.local`에 변수 2개가 있고 Notion 조회가 된다. 실제 행 **7개**, 열은 `이름`(title)·`상품 링크`(url)·`종류`(select)·`이미지 URL`(url)로 ROADMAP 가정과 정확히 일치. 생성 시각 내림차순 정렬도 이미 `fetchAllRows()`가 한다
- 7행 모두 링크·이미지·종류가 채워져 있어 **예외 행(빈 이미지·빈 링크·빈 종류)이 없다**. 사용자 결정(2026-10-25): 테스트 행을 추가하지 않고 진행. 예외 매핑은 터미널에서 `toSafeUrl`과 `getItems()` 결과로 확인하고, 브라우저 예외 확인은 건너뛴다(Task 004·005에서 더미로 이미 검증)
- 앞쪽 4행의 `이미지 URL`이 그림 파일이 아니라 상품 페이지 주소(naver.com)라서 브라우저가 이미지로 못 읽을 가능성이 크다. 그러면 Task 004의 대체 그림이 나오는 것이 **정상**(데이터 문제, 코드 문제 아님). 이것이 실제 데이터에서 대체 그림이 동작하는지 보는 자연스러운 확인이 된다
- `src/lib/notion.ts`의 `requireEnv`·`fetchAllRows()`는 그대로 쓴다. `isFullPage` 필터가 있어 `PageObjectResponse[]`를 받는다
- `src/app/(marketing)/page.tsx`는 동기 컴포넌트에 `revalidate = 300`. Next.js ISR 문서에 `async` 페이지 + `revalidate` 예제가 있어 충돌 없음
- `mockItems`를 쓰는 곳은 `page.tsx` 하나뿐. 삭제해도 다른 참조 없음
- 개발 서버가 포트 3000에서 아직 돌고 있다(Task 004 때 켠 것). 브라우저 확인에 그대로 쓴다
- 브라우저 도구는 Task 004와 같이 npx 캐시의 `playwright-core` + 설치된 Chrome(headless) 스크립트로 한다(메모리 `browser-check-fallback`)

## 결정 사항 (계획 단계에서 미리 정함)

1. **속성 읽기 도우미**: `readTitle`·`readUrl`·`readSelect` 세 함수(각 `(row: PageObjectResponse, name: string) => string`). 하나의 범용 함수보다 타입 좁히기가 명확하고 짧다. 셋 다 열이 없거나 `type`이 다르면 `""`
2. **`toSafeUrl`은 export**, `toItem`은 export하지 않음(명세대로). 접두어 검사만 하고 `new URL()`은 쓰지 않는다
3. **import 경로**: `notion.ts`에서 `./items` 상대 경로(터미널 확인이 `@/` 별칭을 못 풀기 때문, 주석으로 이유 명시)
4. **README 3행**("Notion 연동은 아직 없습니다")도 이번에 고친다. 이 Task가 병합되는 순간 거짓이 되는 문장이라 Task 007까지 두지 않는다. 폴더 그림 81행의 `mock-items.ts` 줄은 삭제
5. **브라우저 예외 확인 생략**(사용자 결정). 대신 터미널에서 `toSafeUrl` 5가지 입력과 `getItems()` 7행 결과를 확인한다

## 수정 순서

1. **구현 (developer 에이전트)**: 작업 파일과 이 계획 파일 경로를 넘겨 구현 단계 1~6을 맡긴다
   - `notion.ts`: `COLUMN` 상수, `toSafeUrl`, `readTitle`·`readUrl`·`readSelect`, `toItem`, `getItems`, 주석 현행화
   - `page.tsx`: `async` + `await getItems()`, `mockItems` import 삭제, 주석 현행화, try/catch 없음
   - `rm src/lib/mock-items.ts`, `grep -rn "mock-items\|mockItems" src/` 0건
   - `README.md`: 3행 현행화 + 81행 삭제
   - `npm run lint` → `npm run build`(`.env.local` 있음) → 라우트 표 `○ /  Revalidate 5m` 유지 확인 → 터미널 확인(단계 6: `getItems()` 행 수·첫 항목 필드, `toSafeUrl` 5가지)
   - 작업 파일 구현 단계 1~6 체크, 상태 `진행 중`. 브라우저 단계 7~9는 메인 대화가 한다
2. **브라우저 확인 (메인 대화)**: 돌고 있는 dev 서버로 headless Chrome 스크립트 실행 → 아래 검증 절
3. **작업 파일 마무리**: 단계 7~9 체크, 브라우저 완료 기준 체크(예외 확인 항목은 "사용자 결정으로 생략, 터미널 확인으로 대체"라고 적고 체크), 상태 `완료`, 변경 요약
4. **계획 파일**: 이 파일을 `plans/2026-10-25-project-notion-cms-task-006-plan.md`로 옮기고 완료 상태 추가
5. **ROADMAP**: `development-planner`에게 "Task 006 완료로 바꿔줘"(Task 006 ✅, 다음 우선순위 Task 007). 커밋은 사용자가 `/ship`(src 변경이라 code-reviewer 필수)

## 검증

1. lint 경고 0 · build 통과(빌드 중 Notion을 실제로 읽음) · 라우트 표 `○ /  Revalidate 5m` (developer 보고). `npm run check-all`도 통과. Stop hook의 자동 build도 `.env.local`이 있어 통과해야 함
2. 터미널(developer 보고):
   - `node --env-file=.env.local --input-type=module -e "import('./src/lib/notion.ts').then(m => m.getItems()).then(r => console.log(r.length, r[0]))"` → 7, 첫 항목 5개 필드 모두 문자열, `category` 비어 있지 않음, `id`는 Notion 페이지 ID
   - `node --input-type=module -e "import('./src/lib/notion.ts').then(m => console.log(['https://a.com','http://a.com','javascript:alert(1)','a.com','',null].map(m.toSafeUrl)))"` → `["https://a.com","http://a.com","","","",""]` (환경변수 없이 실행 가능해야 함 — `requireEnv`는 함수 안에서만 호출)
3. 브라우저 `/` (1280px, 메인 대화):
   - 카드 7장, 순서가 Notion 생성 시각 내림차순(첫 카드 "홈앤힐 포비 … 소파", 마지막 "STEEL TRUNK / 22L")
   - 칩 순서 `전체 · 소파 · 라운지체어 · 그릇 · 수납`(등장 순서, "기타" 없음). "소파" 클릭 → 3장, 주소 불변
   - 모든 카드가 `<a target="_blank" rel="noopener noreferrer">`(링크 전부 있음). 첫 카드 클릭 → 새 탭에 naver 상품 주소, 원래 탭 유지
   - 이미지: 앞 4장은 상품 페이지 주소라 대체 그림(`ImageOff`)이 나올 가능성 — 어느 쪽이든 콘솔 **React 오류** 0건(외부 이미지 로드 실패 네트워크 오류는 정상). 뒤 3장(linenworld·puebco)은 이미지 파일 주소라 로드되어야 함(외부 사이트가 핫링크를 막으면 대체 그림, 이것도 정상이며 기록)
   - 375px: 2열, 칩 한 줄 가로 스크롤
   - 스크린샷 `.playwright-mcp/task-006-desktop.png`·`task-006-mobile.png`(`task-006-exceptions.png`는 테스트 행이 없어 생략, 작업 파일에 사유 기록)
4. `git status --short`: `notion.ts`(M)·`page.tsx`(M)·`mock-items.ts`(D)·`README.md`(M) + 문서(작업 파일·ROADMAP·계획)만. `wishlist-view.tsx`·`category-chips.tsx`·`item-card.tsx`·`item-grid.tsx`·`items.ts`·`error.tsx` 변경 없음

## 범위 밖

- ISR 5분 갱신 실제 확인, 오류 화면·"다시 시도" 확인 → Task 007
- Vercel 배포·환경변수 등록 → Task 008
- 카드 `alt`와 이름 중복(스크린리더 두 번 읽음), 칩 포커스 링 잘림 → 별도 작은 수정
- Notion의 `이미지 URL`에 상품 페이지 주소가 들어 있는 것은 데이터 입력 문제. 코드에서 고치지 않는다(사용자가 Notion에서 이미지 주소로 바꾸면 자동 반영)

## 완료 상태 (2026-10-25)

- ✅ 1단계: `developer` 에이전트가 `notion.ts`(`COLUMN`·`toSafeUrl`·`readTitle`/`readUrl`/`readSelect`·`toItem`·`getItems`)·`page.tsx`(async)·`mock-items.ts` 삭제·`README.md` 구현. lint(경고 0)·build·check-all 통과, `/` `○` Revalidate 5m 유지. 터미널 확인: `getItems()` 7행(5개 필드 모두 문자열, 빈 값 0), `toSafeUrl` 5가지 입력 기대값 일치
- ⚠️ 계획 결정 3(상대 경로 `./items`)은 전제가 틀렸음: Node ESM은 확장자 없는 상대 경로도 `.ts`로 보완하지 않아 `./items`든 `@/lib/items`든 터미널 직접 실행은 실패한다. 코드베이스 관례대로 `@/lib/items`로 되돌리고, 터미널 확인은 스크래치패드의 `node:module.registerHooks` resolve 훅(`node --import <훅> …`)으로 수행(프로젝트 파일 변경 없음). 끝-대-끝 확인은 브라우저·build가 맡는다
- ✅ 2단계: 브라우저(headless Chrome 스크립트) — 카드 7장이 Notion 생성 시각 내림차순(첫 "홈앤힐 포비 …", 마지막 "STEEL TRUNK / 22L"), 칩 `전체·소파·라운지체어·그릇·수납`, "소파" 3장·주소 불변·"전체" 복귀 7장, 모든 카드 `<a target="_blank" rel="noopener noreferrer">`, 첫 카드 클릭 시 새 탭(naver 상품 주소)·원래 탭 유지, 375px 2열. 콘솔 React 오류 0. 이미지: naver 상품 페이지 주소 4건은 `net::ERR_BLOCKED_BY_ORB`로 대체 그림(데이터 문제, 예상대로), linenworld·puebco 3건 정상 로드. 스크린샷 `task-006-desktop.png`·`task-006-mobile.png`
- ✅ 결정 5: 예외 행 브라우저 확인은 사용자 결정으로 생략(테스트 행 미추가). 대체 그림은 실제 데이터(naver 4건)로 자연히 확인됨
- 3~5단계: 작업 파일 마무리 → ROADMAP(development-planner) → `/ship`

## 남은 작업

- 없음. 다음은 "Task 007 작업 파일 만들어줘" (ISR 5분 갱신·오류 화면 확인)
- 데이터 메모(코드 아님): Notion의 앞 4행 `이미지 URL`을 상품 페이지 주소에서 실제 이미지 파일 주소로 바꾸면 사진이 보인다
