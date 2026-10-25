# Task 007: 자동 갱신과 연결 오류 화면 확인하기

담당 기능: F010, F011 · Phase 3 · 상태: 완료

> 맥락: Task 006으로 `/`는 빌드 때 Notion을 실제로 읽어 미리 만들어지고(`export const revalidate = 300`), `getItems()`·`page.tsx`에 try/catch가 없어 Notion 읽기 실패는 그대로 위로 던져져 공용 오류 화면 `src/app/error.tsx`("문제가 생겼습니다" + "다시 시도" = `retry()`)가 받는다. 즉 F010(자동 갱신)과 F011(오류 표시)의 **구조는 이미 완성**됐고, 이 Task는 그 구조가 실제로 동작하는지 눈으로 확인하는 **확인 Task**다. 코드는 거의 바꾸지 않는다 — 바뀔 수 있는 파일은 `README.md`(2건)와 `src/lib/notion.ts`(환경변수 오류 메시지가 모호할 때만, 현재 문구가 충분하면 그대로). `src/app/error.tsx`(공용 문구·버튼 그대로, PRD 가정 "별도 페이지로 만들지 않는다")·`src/app/(marketing)/page.tsx`·`src/components/`는 **건드리지 않는다**. 확인 전용 단계(서버 띄우기·오류 유발·5분 대기)는 developer 에이전트가 하지 않으므로 **메인 대화 + 사용자**가 수행한다.

## 목표

`npm run build && npm run start`로 띄운 배포용 서버에서 Notion 수정이 약 5분 뒤 새로 고침 두 번에 반영되는 것(F010), 그리고 잘못된 API 키·환경변수 누락일 때 오류 화면·"다시 시도"·한국어 터미널 메시지가 나오는 것(F011)을 확인하고, `README.md`에 "build가 Notion을 읽는다"와 "자동 갱신 확인은 `npm run build && npm run start`" 두 줄을 더한다. 이 Task가 끝나면 Phase 3(Notion 연결)이 끝나고 Task 008(Vercel 배포)로 넘어갈 수 있다.

PRD 근거: F010 "페이지를 미리 만들어 두고 약 5분이 지나면 다음 방문 때 뒤에서 Notion을 다시 읽어 새로 만든다(ISR) … 개발 서버(`npm run dev`)에서는 캐시가 동작하지 않으므로 '5분 뒤 반영' 확인은 `npm run build && npm run start`로 한다", F011 "Notion 읽기에 실패하면(API 키·데이터 소스 ID 오류, 네트워크 끊김 등) 공용 오류 화면('다시 시도' 버튼)을 보여주고, 버튼을 누르면 `retry` prop으로 다시 불러온다. 배포본에서는 재생성이 실패해도 이전 내용이 유지되므로, 오류 화면은 캐시가 없는 첫 렌더나 개발 환경에서 주로 보인다", 사용자 여정 1번 "[Notion 연결 실패] → 오류 상태 표시('다시 시도' 버튼) → 버튼 클릭 → 1번으로 다시 불러오기", 4번 "Notion에서 고친 내용은 약 5분 뒤 방문 시 자동 반영. 개발 서버에서는 즉시 반영". PRD 가정 "Notion 연결 실패 화면: 저장소에 이미 있는 공용 오류 화면을 그대로 쓰며, 별도 페이지로 만들지 않는다". ROADMAP 가정 "빌드 시 Notion 접근: Task 006부터 `npm run build`가 빌드 중 Notion을 읽어 `/`를 미리 만들므로, `.env.local`과 네트워크가 있어야 build가 통과한다. 환경변수가 없으면 `src/lib/notion.ts`가 한국어 메시지로 바로 오류를 던지게 해 원인을 알 수 있게 한다", "Notion 연결 검증 시점: … 실제 데이터 연결은 Task 006에서 한다"(→ 그 다음 확인이 이 Task).

## 관련 파일

- 새로 만들 파일: 없음 (스크린샷 `.playwright-mcp/task-007-*.png`만 생김 — git 무시 폴더)
- 고칠 파일:
  - `README.md` — "시작하기" 절(23~31행, 명령 블록 + "`page.tsx`를 고치면 시작 화면이 바로 바뀝니다") 또는 "환경변수" 절(33~48행)에 두 줄 추가: (1) build가 Notion을 읽으므로 `.env.local`·네트워크 없이는 실패한다 (2) 자동 갱신 확인은 `npm run build && npm run start`. 3행 첫 문단 "Notion 연동은 아직 없습니다"는 **Task 006에서 이미** "Notion 데이터 소스에서 소품을 읽어 보여 줍니다"로 바뀌었으므로 손대지 않는다
  - `src/lib/notion.ts` — **조건부**. `requireEnv`의 메시지 ``환경변수 ${name}가 없습니다. .env.local을 확인하세요``(26행)가 터미널에서 모호하게 보일 때만 다듬는다. 현재 문구는 변수 이름·원인·해결 위치가 모두 들어 있어 그대로 둘 가능성이 크다
- 건드리지 않는 파일:
  - `src/app/error.tsx` — `ErrorPage({ error, retry })`, `useEffect`로 `console.error(error)`, `Empty` + "문제가 생겼습니다" + "잠시 후 다시 시도해 주세요. 계속되면 관리자에게 알려 주세요." + `<Button onClick={() => retry()}>다시 시도</Button>`. 이 화면이 **그대로** 보이는지 확인하는 것이 목적이므로 수정하지 않는다
  - `src/app/(marketing)/page.tsx` — `export const revalidate = 300`, `async Home()`, `await getItems()`, try/catch 없음. 그대로
  - `src/components/features/wishlist/*`·`src/components/ui/*`·`src/lib/items.ts` — 변경 없음
  - `.env.local` — 1순위 방법(아래 명세)에서는 **고치지 않는다**. 폴백(c)에서만 잠시 고치고 반드시 원복
- 참고할 기존 코드:
  - `src/lib/notion.ts` — `requireEnv(name)`은 `if (!value) throw …`이므로 환경변수가 **빈 문자열이어도** 누락으로 본다(아래 (b) 방식의 근거). `fetchAllRows()`가 `new Client({ auth: requireEnv("NOTION_API_KEY") })` → 잘못된 키면 Notion API가 401(`unauthorized`)을 돌려주고 SDK가 오류를 던진다. `getItems()`는 그 오류를 그대로 위로
  - `package.json` scripts — `dev: next dev`, `build: next build`, `start: next start`, `lint: eslint`, `check-all: npm run lint && npx next typegen && npx tsc --noEmit`. npm 스크립트에 옵션을 넘길 때는 `--`를 끼운다(`npm run start -- -p 3001`)
  - **Next.js 문서**(`node_modules/next/dist/docs/01-app/`, 2026-10-25 확인):
    - `02-guides/incremental-static-regeneration.md` 100~102행: "시간이 지난 뒤 **다음 요청은 여전히 캐시된(이제 오래된) 페이지를 돌려주고**, 캐시가 무효화되어 새 버전이 **뒤에서** 만들어진다. 성공하면 **그다음 요청**이 새 페이지를 받는다" → "새로 고침 두 번"의 근거. 238행도 같은 설명. 467행: "재검증 중 오류가 나면 마지막으로 성공한 데이터를 캐시에서 계속 제공하고, 다음 요청에서 다시 시도한다" → PRD F011 "배포본에서는 이전 내용 유지"의 근거. 584행: 응답 헤더 `x-nextjs-cache`가 `HIT`(캐시) / `STALE`(캐시 제공 + 뒤에서 재검증 중) / `MISS` / `REVALIDATED`를 알려 준다 → 대기 중 상태를 터미널에서 확인하는 보조 수단
    - `03-api-reference/03-file-conventions/error.md` 117~121행 `retry`: "오류 원인이 일시적일 수 있으므로 … `retry()`는 **에러 바운더리의 자식을 다시 가져와(re-fetch) 다시 그린다**. 성공하면 오류 화면이 결과로 바뀐다". 155~157행 `reset`: "대부분 `retry()`를 써야 하고, `reset()`은 다시 가져오지 않고 상태만 지운다". 331행: `v16.3.0`에서 `retry` prop 안정화. 106·111행: 개발 중에는 `error.message`에 원래 메시지가 담기지만 **production에서는 서버 컴포넌트 오류 메시지가 가려지고 `digest`만 온다**(오류 화면 문구는 고정 문구라 영향 없음)
    - `02-guides/environment-variables.md` 266~274행 "Environment Variable Load Order": **"다음 순서로 찾고, 찾으면 멈춘다 — 1. `process.env` 2. `.env.$(NODE_ENV).local` 3. `.env.local` 4. `.env.$(NODE_ENV)` 5. `.env`"** → 명령 앞에 `NOTION_API_KEY=wrong-key`처럼 붙여 **프로세스 환경변수**로 넘기면 `.env.local`의 값이 덮어쓰지 못한다. 실제 로더 `node_modules/@next/env/dist/index.js`도 `typeof u[t]==="undefined"&&typeof p[t]==="undefined"`일 때만 `.env*` 값을 넣으므로, **빈 문자열(`""`)로 설정한 변수도 "이미 있음"으로 취급**되어 `.env.local`로 채워지지 않는다 → (b) 방식의 근거. 283행: `NODE_ENV`는 `next dev`에서 `development`, 그 외 명령에서 `production`
    - `03-api-reference/06-cli/next.md` 70행(`next dev`)·121행(`next start`): `-p` 또는 `--port <port>` — 포트 지정, 기본 3000, 환경변수 `PORT`도 가능. 336행: "`PORT`는 `.env`에 넣을 수 없다(서버가 뜨는 시점이 더 빠름)". 60행: dev 빌드는 `.next/dev`에, build는 `.next`에 쓰므로 **`next dev`와 `next build`/`next start`를 동시에 돌려도 충돌하지 않는다** — 단, `next dev` 두 개는 같은 `.next/dev`를 쓰므로 이상한 오류가 나면 기존 dev 서버를 먼저 끈다
- 읽을 규칙:
  - `CLAUDE.md` "프로젝트 문서" — 자동 갱신은 `cacheComponents`를 켜지 않고 `export const revalidate = 300`, 개발 서버에서는 캐시가 안 돌아 `npm run build && npm run start`로 확인. 환경변수 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID`
  - `CLAUDE.md` "명령" — `npm run dev` 전에 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 3000 포트 확인. `npm run build`는 dev 서버를 켠 채로 돌려도 된다. 테스트 도구가 없으므로 확인은 lint + build + 브라우저. 스크린샷은 `.playwright-mcp/이름.png`
  - `CLAUDE.md` "구조" — error 컴포넌트의 "다시 시도"는 `retry` prop(`reset`은 다시 불러오지 않음)
  - `CLAUDE.md` "작업 완료 체크리스트" — `npm run check-all` → `npm run build`. Stop hook은 `src/`·설정 파일이 바뀌었을 때만 자동으로 돈다(README만 바꾸면 돌지 않으므로 직접 실행)
  - `.claude/rules/library-docs.md` — Next.js는 웹보다 `node_modules/next/dist/docs/` 우선(위 근거 행 번호)
  - `docs/prd/prd.md` F010·F011 행, 사용자 여정 1·4번, 가정 "Notion 연결 실패 화면"

## 명세

- **`README.md` 2건**(이 Task에서 코드 밖 유일한 확정 변경):
  1. "시작하기" 절의 명령 블록 아래(또는 "환경변수" 절 끝)에 한 줄: "`npm run build`도 빌드 중 Notion을 읽어 `/`를 미리 만들므로, `.env.local`과 네트워크가 없으면 빌드가 실패합니다" (Task 006 code-reviewer 메모. ROADMAP 가정 "빌드 시 Notion 접근"과 같은 내용)
  2. 같은 자리에 한 줄: "Notion에서 고친 내용은 약 5분 뒤 반영됩니다. 개발 서버(`npm run dev`)에서는 캐시가 돌지 않아 매번 새로 읽으므로, 자동 갱신 확인은 `npm run build && npm run start`로 합니다"
  - 3행 첫 문단은 Task 006에서 이미 고쳐졌으므로 **손대지 않는다**. 문구는 한국어, 기존 README 말투(~합니다) 유지
- **ISR 확인(F010) — 반드시 `npm run build` → `npm run start`로**: dev 서버는 캐시가 돌지 않아 ISR을 확인할 수 없다. 순서:
  1. `npm run build`(`.env.local` 있는 상태). 라우트 표에서 `/`가 **`○` Revalidate 5m**인지 다시 확인(`ƒ`면 동적 API가 섞인 것 — 이 Task에서 코드를 안 바꾸니 바뀔 일은 없다)
  2. `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 3000 포트 확인. dev 서버가 떠 있으면 `npm run start -- -p 3001`로 다른 포트에 띄운다(문서 `next.md` 121행 `-p`). 비어 있으면 `npm run start`. 아래 주소는 3001 기준으로 적되 실제 포트에 맞춘다
  3. `http://localhost:3001/` **첫 방문** → 소품 목록 7장(현재 Notion 행 수)이 보이는지, 바꿀 소품의 현재 이름을 기록. 스크린샷 `.playwright-mcp/task-007-isr-before.png`. (보조) `curl -s -D - -o /dev/null http://localhost:3001/ | grep -i x-nextjs-cache` → `HIT`
  4. **사용자가** Notion에서 **기존 소품 하나의 이름 끝에 " ✔"처럼 짧은 표시를 붙인다**(새 행 추가 대신 이름 수정 — 사용자가 테스트 행 추가를 원치 않았음(Task 006 결정). 확인이 끝나면 되돌린다). 수정한 시각을 기록
  5. **5분 안에** 새로 고쳐도 이름이 바뀌지 않는 것이 **정상**(캐시가 동작한다는 뜻, 헤더 `HIT`). 이것을 결과에 적는다
  6. 페이지가 마지막으로 만들어진 시점(build 또는 직전 재생성)부터 **300초 이상** 지난 뒤 새로 고침 **두 번**: 첫 번째는 이전 페이지(이때 헤더 `STALE`, 뒤에서 재생성 시작), 두 번째에 " ✔"가 붙은 이름이 보이면 **통과**(문서 100~102행). 두 번째도 안 바뀌면 재생성이 아직 끝나지 않은 것일 수 있으니 몇 초 뒤 한 번 더. 스크린샷 `.playwright-mcp/task-007-isr-after.png`
  7. 사용자가 Notion 이름을 **원래대로** 되돌린다. `npm run start` 서버를 끈다(Ctrl+C)
  - 대기 시간이 길어 메인 대화는 `sleep` 대신 **헤드리스 브라우저 스크립트로 자동화**할 수 있다(Task 004·006 방식: npx 캐시의 `playwright-core` + 설치된 Chrome headless, 스크립트는 프로젝트 밖 스크래치패드에). 흐름: 첫 방문 → 스크린샷 → (사용자가 Notion 수정했다고 알린 뒤) 300초 대기 → 요청 두 번 → 응답 HTML에서 " ✔"가 붙은 소품 이름을 찾으면 통과 → 스크린샷. 단순히 `curl`로 HTML을 받아 이름을 `grep`해도 된다
- **오류 화면 확인(F011) — `.env.local`을 고치지 않는 방법이 1순위**: Next.js는 이미 설정된 프로세스 환경변수를 `.env.local`로 덮어쓰지 않는다(환경변수 문서 266~274행 "`process.env`를 먼저 보고, 찾으면 멈춘다"; `@next/env` 로더는 `typeof process.env[key] === "undefined"`일 때만 채움). 그래서 명령 앞에 변수를 붙여 **그 서버 프로세스에서만** 값을 바꿀 수 있다
  - **(a) 잘못된 키**: `NOTION_API_KEY=wrong-key npm run dev -- -p 3001`로 별도 dev 서버를 띄우고(3000번 dev 서버가 떠 있으면 그대로 두어도 되지만, `.next/dev`를 같이 쓰므로 이상한 오류가 나면 3000번을 먼저 끈다) `http://localhost:3001/`을 연다. Notion이 401(`unauthorized`)을 돌려주고 `getItems()`가 던진 오류가 `error.tsx`로 가서 **"문제가 생겼습니다"** 제목 + "잠시 후 다시 시도해 주세요. 계속되면 관리자에게 알려 주세요." + **"다시 시도"** 버튼이 보여야 한다. dev에서는 Next.js 오류 오버레이(화면 아래 빨간 표시/모달)가 함께 뜰 수 있다 — 정상. 터미널에도 SDK 오류(401)가 찍힌다. 스크린샷 `.playwright-mcp/task-007-error.png`(오버레이가 가리면 닫고 찍는다)
  - **"다시 시도"(`retry`) 동작**: 그 화면에서 버튼을 클릭하면 페이지를 **다시 불러온다**(문서 `error.md` 121행 "re-fetch and re-render") — 브라우저 개발자 도구 Network 탭에 `/` 요청(RSC fetch)이 다시 나가고, 터미널에 401 오류가 **한 번 더** 찍히고, 오류 화면이 다시 그려진다. 같은 잘못된 키로 다시 읽으므로 **또 실패하는 것이 정상**이다(`reset`이었다면 요청 없이 화면만 바뀜 — 요청이 나가는 것으로 `retry`임을 확인). **정상 복귀 확인**은 그 서버를 끄고(Ctrl+C) 일반 `npm run dev`(또는 이미 떠 있는 3000번)에서 `/`가 소품 목록을 보여 주는 것으로 대신한다 — 프로세스 환경변수는 명령마다 따로이므로 복구할 것이 없다
  - **(b) 환경변수 누락**: `NOTION_DATA_SOURCE_ID= npm run dev -- -p 3001`(`=` 뒤를 비워 **빈 문자열**로 설정. 빈 문자열도 "이미 설정됨"이라 `.env.local`이 채우지 않고, `requireEnv`의 `!value`가 참이 되어 던짐)으로 띄우고 `/`를 열면 터미널에 **`환경변수 NOTION_DATA_SOURCE_ID가 없습니다. .env.local을 확인하세요`**가 찍히고 브라우저에는 같은 오류 화면이 보여야 한다(dev이므로 오버레이에 이 메시지가 그대로 보일 수 있다). 메시지로 "어느 변수가, 왜, 어디서 고치는지"를 알 수 있으면 `notion.ts`는 **그대로**. 모호하다고 판단될 때만 `requireEnv`의 문구를 다듬는다(한국어, 세미콜론 없음·큰따옴표 등 파일 방식 유지, 변수 이름은 계속 템플릿으로)
  - **(c) 폴백**: (a)(b)가 어떤 이유로 동작하지 않을 때만 ROADMAP 원안대로 `.env.local`의 값을 잠시 고친다. **수정 전 값을 먼저 메모**(`.env.local`은 git 미추적이라 `git diff`로 복구 확인이 불가능하다) → 고치고 확인 → **반드시 원복** → 메모와 비교해 같은지 확인. 값은 채팅·문서·커밋에 붙이지 않는다(README 규칙)
- **확인 시 주의**: 두 가지 확인(ISR은 `next start`, 오류는 `next dev`)은 서로 다른 서버다. 동시에 띄우려면 포트를 다르게 한다(`next start`는 `.next`, `next dev`는 `.next/dev`를 써서 충돌하지 않음 — 문서 `next.md` 60행). 확인이 끝나면 임시로 띄운 서버는 모두 끈다
- **공통**: 화면 문구·부품·`error.tsx` 변경 없음. 오류 전용 페이지를 새로 만들지 않는다(PRD 가정). 변경 파일은 `README.md`(+ 필요 시 `src/lib/notion.ts`)뿐이어야 한다

## 구현 단계

- [x] 1. (developer) `README.md` — "시작하기" 또는 "환경변수" 절에 두 줄 추가: (1) `npm run build`도 Notion을 읽으므로 `.env.local`·네트워크 없이는 실패 (2) 자동 갱신 확인은 `npm run build && npm run start`(개발 서버는 캐시가 돌지 않음). 3행 첫 문단은 Task 006에서 이미 고쳐졌으므로 그대로
- [x] 2. (developer) `npm run check-all` → `npm run build`(`.env.local` 있는 상태). 라우트 표에서 `/`가 **`○` Revalidate 5m**인지 재확인. 빌드 로그에 Notion 오류가 없는지 확인
- [x] 3. (메인 대화 + 사용자) **오류 화면 (a) 잘못된 키**: `lsof -nP -iTCP:3000 -sTCP:LISTEN` 확인 → `NOTION_API_KEY=wrong-key npm run dev -- -p 3001` → `http://localhost:3001/` → "문제가 생겼습니다" + "다시 시도" 확인, 터미널 401 확인, 스크린샷 `.playwright-mcp/task-007-error.png`. "다시 시도" 클릭 → `/` 요청이 다시 나가고 터미널에 오류가 한 번 더 찍히며 오류 화면이 다시 그려지는지 확인(`retry` 동작). 서버를 끈다
- [x] 4. (메인 대화 + 사용자) **오류 화면 (b) 환경변수 누락**: `NOTION_DATA_SOURCE_ID= npm run dev -- -p 3001` → `/` → 터미널에 `환경변수 NOTION_DATA_SOURCE_ID가 없습니다. .env.local을 확인하세요` 확인. 메시지가 모호하면 (developer) `src/lib/notion.ts`의 `requireEnv` 문구만 다듬고 2단계를 다시 돈다. 충분하면 그대로. 서버를 끈다
- [x] 5. (메인 대화) **정상 복귀**: 일반 `npm run dev`(또는 떠 있는 3000번)에서 `/`가 소품 목록을 보여 주는지 확인(`.env.local`은 손대지 않았으므로 바로 정상). (c) 폴백을 썼다면 여기서 `.env.local` 원복과 메모 대조
- [x] 6. (메인 대화 + 사용자) **ISR 확인 — 준비**: 2단계의 build 결과로 `npm run start`(3000 사용 중이면 `npm run start -- -p 3001`). `/` 첫 방문 → 소품 목록·바꿀 소품 이름 기록, 스크린샷 `.playwright-mcp/task-007-isr-before.png`. (보조) `curl -s -D - -o /dev/null http://localhost:3001/ | grep -i x-nextjs-cache` → `HIT`
- [x] 7. (사용자) Notion에서 기존 소품 하나의 이름 끝에 " ✔"를 붙인다(새 행 추가 안 함). 수정 시각 기록. (메인 대화) 5분 안에 새로 고쳐 **바뀌지 않음**(= 캐시 동작)을 기록
- [x] 8. (메인 대화) 300초 이상 지난 뒤 새로 고침 **두 번**(또는 헤드리스 스크립트/`curl`로 자동화: 300초 대기 → 두 번 요청 → HTML에서 " ✔" 이름 검색). 첫 번째는 이전 페이지(헤더 `STALE`), 두 번째에 바뀐 이름 → 통과. 스크린샷 `.playwright-mcp/task-007-isr-after.png`. (사용자) Notion 이름을 원래대로 되돌린다. `npm run start` 서버를 끈다
- [x] 9. (메인 대화) `git status --short`·`git diff --stat`으로 변경이 `README.md`(+ 4단계에서 고쳤다면 `src/lib/notion.ts`)뿐인지 확인. `src/app/error.tsx`·`page.tsx`·`src/components/`·`src/lib/items.ts` 변경 없음. 임시 서버가 모두 꺼졌는지(`lsof -nP -iTCP:3001 -sTCP:LISTEN` 비어 있음), `.env.local`이 원래 값인지(폴백을 썼을 때), Notion 이름이 원복됐는지 확인

## 완료 기준

- [x] `npm run lint`(`npm run check-all`) 통과
- [x] `npm run build` 통과(`.env.local` 있는 상태), 라우트 표에서 `/` **`○` Revalidate 5m**
- [x] `README.md`에 "build가 Notion을 읽음(`.env.local`·네트워크 필요)"과 "자동 갱신 확인은 `npm run build && npm run start`" 두 줄이 있음. 3행 첫 문단은 변경 없음
- [x] 오류 화면(F011): 잘못된 `NOTION_API_KEY`로 띄운 서버에서 `/`가 `error.tsx`의 "문제가 생겼습니다" + "다시 시도"를 보여 줌. "다시 시도" 클릭 시 `/`를 다시 불러옴(요청 재발생, 터미널 오류 재출력 — 같은 잘못된 키라 다시 실패하는 것이 정상). 정상 키 서버(`npm run dev`)에서 `/`가 소품 목록을 보여 줌
- [x] 환경변수 누락(F011): `NOTION_DATA_SOURCE_ID`가 빈 값인 서버에서 터미널에 `환경변수 NOTION_DATA_SOURCE_ID가 없습니다. .env.local을 확인하세요`가 찍힘(메시지가 모호해 다듬었다면 그 문구)
- [x] 자동 갱신(F010): `npm run start`에서 첫 방문 뒤 사용자가 Notion 소품 이름을 바꾸고, 5분 안에는 바뀌지 않으며(캐시), 300초 뒤 새로 고침 **두 번**에 바뀐 이름이 반영됨
- [x] 원복: Notion 소품 이름 되돌림. `.env.local`은 고치지 않았거나(1순위 방법) 고쳤다면 메모와 같은 값으로 원복. 임시로 띄운 서버(3001 등) 모두 종료
- [x] 변경 파일이 `README.md`(+ 필요 시 `src/lib/notion.ts`)뿐. `error.tsx`·`page.tsx`·`src/components/`·`items.ts` 변경 없음
- [x] 스크린샷 `.playwright-mcp/task-007-isr-before.png`·`task-007-isr-after.png`·`task-007-error.png`

## 범위 밖 메모

- **Vercel 배포와 환경변수 등록**은 **Task 008**. 배포본에서는 재생성 실패 시 마지막 성공 페이지가 유지되므로(ISR 문서 467행) 오류 화면이 거의 보이지 않는다 — 그 확인도 Task 008
- **오류 전용 페이지 신설 금지**(PRD 가정 "Notion 연결 실패 화면"). `error.tsx`의 문구·버튼도 바꾸지 않는다. production에서 `error.message`가 가려지는 것(`error.md` 106·111행)은 고정 문구를 쓰는 지금 구조에 영향이 없다
- 남은 작은 수정 2건은 **별도**(이 Task 커밋에 섞지 않음): 카드 `item-card.tsx`의 `<img alt>`와 이름 `<p>` 중복(스크린리더가 이름을 두 번 읽음, Task 004 리뷰), `category-chips.tsx`의 `overflow-x-auto`로 칩 포커스 링이 잘릴 수 있음(Task 005 리뷰, 미확인)
- `toSafeUrl`의 대소문자(`HTTPS://`)·앞뒤 공백 허용(Task 006 리뷰 메모)도 **별도**
- 테스트 행 추가는 하지 않는다(사용자 결정, Task 006). ISR 확인은 기존 소품의 이름 수정 → 원복으로 한다
- `PORT`는 `.env.local`에 넣어도 적용되지 않는다(`next.md` 336행). 포트는 `-p`로만 바꾼다

## 변경 요약

- (developer, 단계 1~2) 고친 파일: `README.md` — "환경변수" 절 끝, "배포할 때는 Vercel …" 문장 **앞**에 두 문단 추가: (1) "`npm run build`도 빌드 중 Notion을 읽어 `/`를 미리 만들므로, `.env.local`과 네트워크가 없으면 빌드가 실패합니다." (2) "Notion에서 고친 내용은 약 5분 뒤 반영됩니다. 개발 서버(`npm run dev`)에서는 캐시가 돌지 않아 매번 새로 읽으므로, 자동 갱신 확인은 `npm run build && npm run start`로 합니다." 3행 첫 문단과 다른 절은 변경 없음. `src/lib/notion.ts`는 고치지 않음(단계 4에서 메시지가 모호하다고 판단될 때만)
- 확인(2026-10-25): `npm run check-all` 통과(lint 경고 0, typegen 성공, tsc 오류 0) · `npm run build` 통과(`- Environments: .env.local`, Notion 오류 없음, 라우트 표 `○ /  5m  1y`, `○ /_not-found`). 이 build 결과(`.next`)를 단계 6의 `npm run start`가 그대로 쓴다
- 남긴 일: 단계 3~9(오류 화면 (a)(b), 정상 복귀, ISR 확인, 원복, 변경 파일 확인)와 완료 기준의 나머지 항목·스크린샷은 **메인 대화 + 사용자** 몫
- 오류 화면 (a) 잘못된 키(2026-10-25, 메인 대화): `NOTION_API_KEY=wrong-key npm run dev -- -p 3001`로 띄운 서버에서 headless Chrome으로 `/` 열기 → "문제가 생겼습니다"·"잠시 후 다시 시도해 주세요…"·"다시 시도" 버튼 각 1개, 카드 0장. "다시 시도" 클릭 → `/` 요청 1건 추가 발생, 오류 화면 재렌더, 서버 로그에 `APIResponseError: API token is invalid. (401 unauthorized)` 2회(첫 로드 + retry) → `retry`가 다시 불러오는 것 확인. dev 오버레이 "2 Issues" 표시는 정상. 스크린샷 `.playwright-mcp/task-007-error.png`. `.env.local` 미수정(폴백 (c) 불필요 — 환경변수 우선순위를 `@next/env` 로더로 사전 검증)
- 오류 (b) 환경변수 누락: `NOTION_DATA_SOURCE_ID= npm run dev -- -p 3001` → `/` 요청(HTTP 500) → 서버 로그에 `환경변수 NOTION_DATA_SOURCE_ID가 없습니다. .env.local을 확인하세요` 1회. 변수 이름·원인·고칠 위치가 모두 있어 `src/lib/notion.ts`는 **변경 없음**
- 정상 복귀: 임시 서버 종료 후 `npm run start`(3000, developer의 build 결과)에서 `/` 200, `x-nextjs-cache: HIT`, 카드 7장, 첫 카드 "홈앤힐 포비 …". 스크린샷 `task-007-isr-before.png`. 첫 방문 12:49:50Z(build 12:48:01Z)
- 자동 갱신(F010) 1차: 사용자가 Notion 첫 소품 이름 끝에 " ✔" 추가. 첫 방문 뒤 487초(12:57:58Z) 요청에서 이미 `HIT` + ✔ 반영. 반영 자체는 확인됐으나 "5분 안 불변"과 "첫 요청 STALE"은 관찰 못 함(답이 5분 창 이후에 왔고, 그 사이 다른 방문으로 재생성이 끝나 있었던 것으로 **추정**). 스크린샷 `task-007-isr-after.png`(✔ 보임)
- 자동 갱신 2차(원복을 두 번째 변경으로 활용): 재생성 12:57:58Z 기준 283초 뒤(13:02:41Z) 요청 → `HIT` + ✔ 그대로(**5분 안 불변 = 캐시 동작 확인**). 310초 뒤 13:03:08Z 요청 1 → `STALE` + ✔ 그대로(이전 페이지 제공, 뒤에서 재생성), 3초 뒤 요청 2 → `HIT` + ✔ 없음(**새 페이지 반영**). Next.js 문서의 "새로 고침 두 번" 동작과 정확히 일치. 메모: `next start`의 재생성 결과는 메모리에만 있고 `.next/server/app/index.html` 파일(12:48:02Z)은 바뀌지 않음
- 원복: Notion 이름 원복(사용자, 요청 2 결과로 확인). `.env.local` 미수정. 3000·3001 모두 종료(`lsof` 비어 있음)
- 변경 파일: `README.md`(+4행)뿐. `src/`·`error.tsx`·`page.tsx` 변경 없음
- 남긴 일: 없음. 다음은 Task 008(Vercel 배포). 별도 작은 수정 3건(카드 `alt` 중복, 칩 포커스 링, `toSafeUrl` 대소문자·공백)은 그대로 보류
