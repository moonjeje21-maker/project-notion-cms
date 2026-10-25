# Task 008: Vercel에 배포하고 환경변수 등록하기

담당 기능: F010, F011 · Phase 4 · 상태: 완료

> 맥락: Phase 0~3(스타터 정리 → 뼈대 → 화면 → Notion 연결, Task 007의 ISR·오류 화면 확인까지)이 끝났고, 이 Task가 마지막(Phase 4)이다. 지금까지는 내 컴퓨터(`npm run build && npm run start`)에서만 확인했다. 이 Task는 같은 사이트를 **Vercel**(Next.js를 만든 회사의 호스팅 서비스, 무료 플랜)에 올려 지인에게 줄 수 있는 주소를 만들고, 그 주소에서도 전체 흐름과 5분 자동 갱신이 되는지 확인하는 **배포·확인 Task**다. 코드 변경은 `README.md`에 배포 주소 한 줄 + "환경변수는 Vercel 설정에서 등록" 보강뿐이다. **건드리지 않는 파일**: `src/` 전체, `next.config.ts`(빈 설정 `const nextConfig: NextConfig = {}` — Vercel이 Next.js를 자동 감지하므로 설정이 필요 없다), `.env.local`, `package.json`. Vercel 계정 가입·GitHub 연결·환경변수 입력은 **사용자가 Vercel 웹 화면에서 직접** 한다(ROADMAP 가정 "배포 Phase"). 배포 주소가 나온 뒤의 화면 확인은 메인 대화(headless Chrome)가 돕는다.

## 목표

GitHub 저장소 `project-notion-cms`를 Vercel에 연결해, **환경변수 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID`를 먼저 등록한 뒤** 첫 배포를 성공시키고, 배포 주소(`https://<프로젝트>.vercel.app`)에서 소품 목록 → 칩 필터 → 카드 새 탭 흐름과 "Notion에서 고친 내용이 약 5분 뒤 반영"을 확인한다. 끝나면 Living Wishlist가 공개 주소로 열리고, 이후 `main`에 병합하면 자동으로 다시 배포된다.

PRD 근거: 기술 스택 "Vercel (무료 플랜, 다음 단계에 예정) — Next.js 호스팅과 ISR 지원", F011 "배포 전에 Vercel 환경변수(`NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`)를 먼저 등록한다", F010 "약 5분이 지나면 다음 방문 때 뒤에서 Notion을 다시 읽어 새로 만든다(ISR) … 수동 재배포 없이 'Notion에 한 줄 추가 → 웹 반영'이 돼야 함", 사용자 여정 4번 "Notion에서 고친 내용은 약 5분 뒤 방문 시 자동 반영". ROADMAP 가정 "빌드 시 Notion 접근": Task 006부터 build가 Notion을 읽으므로 환경변수 없이는 빌드가 실패한다.

## 관련 파일

- 새로 만들 파일: 없음 (스크린샷 `.playwright-mcp/task-008-prod-desktop.png`·`task-008-prod-mobile.png`만 생김 — git 무시 폴더)
- 고칠 파일:
  - `README.md` — 52행 "배포할 때는 Vercel 프로젝트 설정의 Environment Variables에 같은 이름으로 등록합니다." 문장 자리(또는 바로 아래)에 배포 주소 한 줄과 자동 재배포 한 줄 추가(아래 명세 7). 배포 주소는 **사용자가 알려 준 값**만 적는다
- 건드리지 않는 파일: `src/`(전부), `next.config.ts`, `package.json`, `.env.local`, `ROADMAP.md`(완료 처리는 이 Task가 끝난 뒤 별도 요청으로)
- 확인한 현재 상태(2026-10-25):
  - `.gitignore`: 33~34행 `.env*`(환경변수 파일이 git에 안 올라감), 36~37행 `# vercel` + `.vercel`(Vercel이 로컬에 남기는 폴더도 이미 무시) → **추가할 것 없음**. `.vercel`은 웹 대시보드 방식에서는 생기지도 않는다
  - `next.config.ts`: 빈 설정 → 그대로
  - `package.json`: `scripts.build = "next build"`(Vercel 기본 Build Command와 같음), **`engines` 필드 없음**. README는 "Node.js 20.9 이상"이라 적었고 Next.js 16이 그 이상을 요구한다. Vercel 프로젝트의 Node.js 버전 기본값(Settings → General → Node.js Version)이 20.9 이상이므로 지금은 `engines`를 추가하지 않는다 — 빌드 로그에서 Node 버전 오류가 나면 그때 Vercel 설정에서 버전을 올린다(`package.json`을 건드리지 않고 해결)
  - Vercel CLI(`vercel` 명령)는 설치돼 있지 않다(`which vercel` 없음). **웹 대시보드로 진행하고 CLI는 설치하지 않는다**. 설치가 필요해지면 `.claude/rules/dependencies.md` 절차를 먼저 따른다
  - GitHub 원격: `https://github.com/moonjeje21-maker/project-notion-cms.git`, 기본 브랜치 `main`, 모든 변경은 PR로 병합됨
- 참고할 기존 코드:
  - `src/lib/notion.ts` 23~29행 `requireEnv(name)`: `if (!value) throw new Error(`환경변수 ${name}가 없습니다. .env.local을 확인하세요`)`. Vercel에서 환경변수를 빼먹으면 빌드 로그에 이 한국어 메시지가 그대로 찍히며 빌드가 실패한다(메시지의 ".env.local"은 로컬 안내지만 변수 이름은 정확하므로 Vercel에서는 변수 이름만 보고 Settings에서 추가한다)
  - `src/app/(marketing)/page.tsx`: `export const revalidate = 300`, `await getItems()`. Vercel에서도 같은 코드로 ISR이 돈다
  - Task 007 파일(`docs/roadmap/tasks/007-isr-and-error-screen-check.md`)의 "5분 안 불변 → 300초 뒤 새로 고침 두 번 반영" 확인 절차를 배포 주소에 그대로 적용한다
  - **Next.js 문서**(`node_modules/next/dist/docs/01-app/`, 2026-10-25 확인): `02-guides/deploying-to-platforms.md` 41행 기능 표 "ISR (time-based) … Works per-instance without shared cache"와 81행 "Vercel's adapter uses the same public API as every other adapter"(Vercel은 Next.js 공식 지원 배포 대상), `01-getting-started/17-deploying.md` 84행이 Vercel을 배포 옵션으로 안내. **"Vercel에서 ISR이 그대로 동작한다"를 한 줄로 못 박는 문장은 로컬 문서에 없다 → 문서 미확인**(실제 동작은 아래 6단계 배포 확인으로 증명한다). Vercel 화면·동작의 최신 설명은 `https://vercel.com/docs/frameworks/full-stack/nextjs`(17-deploying.md 84행 링크, 공식 사이트)를 참고한다
- 읽을 규칙: `CLAUDE.md` "프로젝트 문서"(데이터 소스 ID, `revalidate = 300`, `<img>`), "작업 완료 체크리스트"(`npm run check-all` → `npm run build`), `README.md` "환경변수" 절(값은 채팅·문서·커밋에 붙이지 않는다), `.claude/rules/dependencies.md`(CLI를 설치해야 할 때만)

## 명세

Vercel 화면 용어는 영어 그대로 쓰고 한국어로 풀어 쓴다. 아래 1~6은 **사용자가 Vercel 화면에서** 하고, 메인 대화는 옆에서 확인을 돕는다.

1. **가입·저장소 가져오기**: vercel.com에서 **GitHub 계정으로 가입/로그인(Continue with GitHub)** → 대시보드에서 **Add New… → Project**(새 프로젝트 만들기) → GitHub 연결 화면에서 Vercel의 GitHub 앱 설치·권한을 허용하되 **`project-notion-cms` 저장소만 선택**(권한은 이 저장소로 좁혀도 된다) → 목록에서 `project-notion-cms`의 **Import**(가져오기)
2. **Deploy 버튼을 누르기 전에 환경변수 등록(가장 중요)**: 설정 화면의 **Environment Variables**(환경변수) 영역을 펼쳐 두 개를 추가한다. 값은 `.env.local`과 **같은 값**이다.
   - `NOTION_API_KEY`
   - `NOTION_DATA_SOURCE_ID`
   - 적용 환경은 **Production·Preview·Development 모두 체크**(기본값이 모두 체크). 값은 **채팅·문서·커밋에 적지 않는다**(README 규칙). 값을 복사할 때는 `.env.local`을 열어 복사해 Vercel 입력칸에 붙여 넣는다
   - 같은 화면의 나머지는 **기본값 그대로**: Framework Preset = Next.js(자동 감지), Build Command = `npm run build`, Output Directory = 기본, Install Command = 기본, **Root Directory = 비움**(저장소 루트에 `package.json`이 있다)
3. **Deploy**(배포) 클릭 → 빌드 로그(Building)를 열어 확인한다. 성공하면 로그의 라우트 표에 **`○ /` + Revalidate `5m`**(5분 간격으로 다시 만듦)이 보이고 Notion 관련 오류가 없다. 끝나면 **배포 주소 `https://<프로젝트>.vercel.app`**(Domains 영역)을 사용자가 메인 대화에 알려 준다
4. **환경변수를 빼먹어 빌드가 실패했다면**: 빌드 로그에 한국어 `환경변수 NOTION_API_KEY가 없습니다. .env.local을 확인하세요`(또는 `NOTION_DATA_SOURCE_ID`)가 보인다 → 프로젝트 **Settings → Environment Variables**에서 빠진 변수를 추가 → **Deployments** 탭에서 실패한 배포의 `⋯` 메뉴 **Redeploy**(같은 코드로 다시 배포). 변수를 추가한 뒤에는 반드시 Redeploy해야 반영된다(이미 만든 빌드에는 소급 적용되지 않는다). 키 값이 틀렸다면 로그에 `API token is invalid (401)`, 데이터 소스 ID가 틀렸다면 `object_not_found`(404)가 보인다(README "값을 얻는 순서" 참고)
5. **배포 주소 확인**(사용자 + 메인 대화의 headless Chrome):
   - 소품 카드 **7장**(현재 Notion 행 수), 종류 칩 필터 동작, 카드 클릭 시 **새 탭**으로 상품 링크
   - 현재 Notion 7행 중 **4행은 "이미지 URL"이 상품 페이지 주소라 대체 그림**이 나온다. 이것은 **데이터 문제이고 사용자가 MVP에서 제외하기로 결정**했으므로 배포본에서도 대체 그림 4장이 **정상**이다
   - "기타" 배지는 현재 데이터에 해당 소품이 없어 **보이지 않는 것이 정상**
   - 휴대폰 폭(약 390px)에서 카드 **2열**, 다크 모드 전환 정상, 브라우저 콘솔 오류 0건
   - 스크린샷 `.playwright-mcp/task-008-prod-desktop.png`(데스크톱 폭, 카드 4열)·`task-008-prod-mobile.png`(휴대폰 폭, 2열)
6. **F010 배포본 자동 갱신 확인**(Task 007과 같은 방식): 사용자가 Notion에서 기존 소품 하나의 **이름 끝에 " ✔"**를 붙이고(새 행 추가 안 함) 수정 시각을 기록 → **5분 안**에 배포 주소를 새로 고쳐도 **바뀌지 않는 것이 정상**(캐시) → 5분(300초) 이상 지난 뒤 새로 고침 **두 번**: 첫 번째는 이전 페이지, 두 번째에 " ✔"가 보이면 통과. 보조로 `curl -s -D - -o /dev/null https://<주소>/ | grep -i -E 'x-vercel-cache|x-nextjs-cache'`로 `HIT`/`STALE` 확인(Vercel은 `x-vercel-cache`를 쓴다. 헤더 값이 기대와 달라도 화면 반영 결과가 판단 기준). 확인 뒤 **사용자가 Notion 이름을 원래대로 되돌린다**. 재생성이 실패하면 마지막 성공 페이지가 유지되므로(ISR 문서 467행) **배포본에서 오류 화면이 보이지 않는 것이 정상**이다
7. **README 보강**(developer): 52행 "배포할 때는 Vercel …" 문장을 두고, 그 아래에 두 줄을 더한다. 배포 주소는 사용자가 알려 준 값을 그대로 적는다.
   - 배포 주소: `https://<사용자가 알려 준 주소>`
   - "`main`에 병합하면 Vercel이 자동으로 다시 배포합니다. 환경변수는 코드에 넣지 않고 Vercel 프로젝트 설정(Settings → Environment Variables)에서 등록합니다."
   - 문구는 한국어, 기존 README 말투(~합니다). 값(키·ID)은 절대 적지 않는다
8. **(선택) Git 설정 확인**: Vercel 프로젝트 **Settings → Git**에서 **Production Branch**가 `main`인지 확인한다. `main` 병합마다 Production 배포가 생기고, **PR마다 Preview 배포**(미리 보기 주소)가 따로 생긴다. Preview도 같은 환경변수를 쓰므로 2단계에서 **Preview에 체크**돼 있어야 PR 미리 보기 빌드가 실패하지 않는다(체크가 빠졌다면 Settings → Environment Variables에서 해당 변수의 환경을 편집)

## 구현 단계

- [x] 1. (사용자 — Vercel 화면) vercel.com에 GitHub 계정으로 가입/로그인 → Add New… → Project → GitHub 앱 권한에서 `project-notion-cms` 저장소 선택 → Import
- [x] 2. (사용자 — Vercel 화면) **Deploy 전에** Environment Variables에 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID`를 `.env.local`과 같은 값으로 추가(Production·Preview·Development 모두 체크). Framework Preset = Next.js, Build Command `npm run build`, Output·Install 기본값, Root Directory 비움 그대로 확인. 값은 채팅에 적지 않는다
- [x] 3. (사용자 — Vercel 화면) Deploy 클릭 → 빌드 로그에서 `○ /` Revalidate 5m과 Notion 오류 없음 확인 → 배포 주소(`https://<프로젝트>.vercel.app`)를 메인 대화에 알려 준다. 실패하면 명세 4(환경변수 확인 → Settings에서 추가 → Redeploy)
- [x] 4. (메인 대화 — 배포 주소 확인) headless Chrome으로 배포 주소 확인: 카드 7장, 칩 필터, 카드 새 탭(`target="_blank"`·`rel="noopener noreferrer"`), 대체 그림 4장(데이터 문제로 정상), "기타" 배지 없음(현재 데이터), 다크 모드, 콘솔 오류 0. 스크린샷 `.playwright-mcp/task-008-prod-desktop.png`·`task-008-prod-mobile.png`(휴대폰 폭 2열)
- [x] 5. (사용자 + 메인 대화) F010 배포본 확인: 사용자가 Notion 소품 이름 끝에 " ✔" 추가 → 5분 안 불변 기록 → 300초 이상 지난 뒤 새로 고침 두 번에 반영(`x-vercel-cache` 또는 `x-nextjs-cache` 헤더 `HIT`/`STALE` 보조 확인) → 사용자가 Notion 이름 원복
- [x] 6. (developer — README 수정 + check-all) **사용자가 배포 주소를 알려 준 뒤에만** `README.md`에 배포 주소 한 줄 + "`main` 병합 시 자동 재배포, 환경변수는 Vercel 설정에서 등록" 한 줄 추가 → `npm run check-all` → `npm run build`(로컬, `.env.local` 있는 상태). 값(키·ID)이 README에 들어가지 않았는지 확인
- [x] 7. (사용자 — Vercel 화면, 선택) Settings → Git에서 Production Branch가 `main`인지, 환경변수가 Preview에도 체크돼 있는지 확인
- [x] 8. (메인 대화) `git status --short`·`git diff --stat`으로 변경 파일이 `README.md`뿐인지, `.env.local`·`src/`·`next.config.ts`·`package.json` 변경이 없는지, 임시 서버가 없는지 확인. 커밋·PR은 사용자가 `/ship`으로 한다

## 완료 기준

- [x] Vercel 빌드 성공 — 빌드 로그에 `○ /` Revalidate `5m`이 보이고 Notion 오류가 없음
- [x] 배포 주소에서 전체 흐름(목록 7장 → 칩 필터 → 카드 새 탭) 동작. 대체 그림 4장은 정상(데이터 문제, MVP 제외 결정), "기타" 배지는 현재 데이터에 없음
- [x] 휴대폰 폭 카드 2열, 데스크톱 4열, 다크 모드 정상, 콘솔 오류 0건
- [x] Notion 변경이 배포 주소에 반영됨: 5분 안에는 불변, 300초 뒤 새로 고침 두 번에 반영(F010). Notion 이름 원복
- [x] 환경변수 두 개가 Vercel Environment Variables에 등록됨(Production·Preview·Development), 값이 채팅·문서·커밋·README 어디에도 없음(F011 "배포 전에 환경변수를 먼저 등록")
- [x] `README.md`에 배포 주소 한 줄과 "환경변수는 Vercel 설정에서 등록" 보강이 있음
- [x] `npm run lint`(`npm run check-all`) 통과, `npm run build` 통과(로컬)
- [x] 변경 파일은 `README.md`뿐. `.env.local`·`src/`·`next.config.ts`·`package.json` 변경 없음. Vercel CLI 미설치 유지
- [x] 스크린샷 `.playwright-mcp/task-008-prod-desktop.png`·`task-008-prod-mobile.png`

## 범위 밖 메모

- 커스텀 도메인(내 도메인 연결), Vercel Analytics는 하지 않는다 (PRD 밖)
- 상품 링크에서 이미지 자동 수집은 **MVP 제외 결정(2026-10-25)**. 대체 그림 4장은 그대로 둔다
- 남은 작은 수정 3건은 **별도**(이 Task 커밋에 섞지 않음): 카드 `item-card.tsx`의 `<img alt>`와 이름 `<p>` 중복, `category-chips.tsx`의 `overflow-x-auto`로 칩 포커스 링이 잘릴 수 있음, `toSafeUrl`의 대소문자(`HTTPS://`)·앞뒤 공백 허용
- `engines` 필드는 추가하지 않는다. Node 버전 문제가 로그에 나오면 Vercel 설정에서 버전을 올린다
- Vercel CLI(`vercel`)는 설치하지 않는다. 필요해지면 `.claude/rules/dependencies.md` 절차를 먼저 따른다
- 로컬 dev 서버(3000)가 떠 있을 수 있으나 이 Task는 로컬 서버를 쓰지 않는다
- 배포 후에도 오류 화면(F011)을 일부러 보려면 환경변수를 틀리게 넣어야 하는데, 배포본에서는 이전 성공 페이지가 유지되어 보이지 않는다. 오류 화면 확인은 Task 007에서 끝났으므로 다시 하지 않는다

## 변경 요약

- (developer, 단계 6) 고친 파일: `README.md` — 52행 "배포할 때는 Vercel 프로젝트 설정의 Environment Variables에 같은 이름으로 등록합니다." 문장을 **지우고**, 그 자리에 새 절 `## 배포`("환경변수" 절 다음, "들어 있는 화면" 절 앞)를 추가. 내용 3문장: 배포 주소 `https://project-notion-cms.vercel.app`(사용자가 알려 준 프로덕션 주소) · "`main`에 병합하면 Vercel이 자동으로 다시 배포합니다" · "환경변수는 Vercel 프로젝트 설정(Settings → Environment Variables)에 등록되어 있으며 `.env.local`과 같은 이름을 씁니다. 값이 없으면 빌드가 실패합니다". 3행 첫 문단과 다른 절은 변경 없음. 키·ID 값은 README에 없음(변수 이름만)
- 결정: 명세 7은 "52행 문장을 두고 아래에 두 줄 추가"였으나, 메인 대화 지시대로 겹치는 52행을 지우고 별도 절로 묶는 쪽(더 단순)을 택함
- 확인(2026-10-25): `npm run check-all` 통과(lint 경고 0, typegen 성공, tsc 오류 0). `npm run build`는 코드 변경이 없어 메인 대화 지시로 생략(완료 기준 "build 통과(로컬)"는 미체크)
- 남긴 일(메인 대화 + 사용자 몫): 단계 1~5·7·8의 체크박스와 완료 기준의 나머지 항목(Vercel 빌드 성공, 배포 주소 흐름 확인, 반응형·다크 모드·콘솔, F010 배포본 갱신, 환경변수 등록 확인, 변경 파일 확인, 스크린샷). 상태 `완료` 처리와 ROADMAP 갱신은 별도 요청으로
- Vercel 배포(사용자, 2026-10-25): GitHub 저장소 Import → Deploy 전 환경변수 2개 등록 → Deploy 성공. 도메인 3개 중 프로덕션은 `https://project-notion-cms.vercel.app`(나머지 `…-git-main-kymoon.vercel.app`은 `main` 브랜치 별칭, `…-actlaldne-kymoon.vercel.app`은 배포 1건 고유 주소)
- 배포 주소 확인(메인 대화, headless Chrome): `HTTP/2 200`, `x-vercel-cache: HIT`. 카드 7장·칩 `전체·소파·라운지체어·그릇·수납`·"소파" 3장(주소 불변)·"전체" 7장·첫 카드 새 탭(원래 탭 유지)·375px 2열·콘솔 오류 0. 네이버 상품 페이지 주소 4건은 `ERR_BLOCKED_BY_ORB`로 대체 그림(데이터 문제, MVP 제외 결정). 스크린샷 `.playwright-mcp/task-008-prod-desktop.png`·`task-008-prod-mobile.png`
- F010 배포본(사용자 Notion 이름에 " ✔" 추가): 수정 직후 요청 `x-vercel-cache: HIT`, `age: 125`, ✔ 없음(5분 안 불변). 생성 시각 + 310초(13:30:53Z) 요청 1 → `STALE`, `age: 310`, ✔ 없음(이전 페이지 제공·뒤에서 재생성), 3초 뒤 요청 2 → `HIT`, `age: 2`, ✔ 반영. Next.js 문서의 "새로 고침 두 번" 동작과 일치. 스크린샷 `task-008-prod-isr-after.png`
- 로컬 build(메인 대화): 통과, 라우트 표 `○ /  5m` 유지. `npm run check-all` 통과(developer)
- 변경 파일: `README.md`(배포 절 추가, 중복 문장 1줄 삭제)뿐. `src/`·`next.config.ts`·`package.json`·`.env.local` 변경 없음. Vercel CLI 미설치 유지. 계획 파일 없음(코드 변경이 README뿐이고 사용자 단계가 먼저라 plan 모드 생략, 작업 파일이 계획 역할)
- 단계 7(Vercel Settings → Git 확인)은 선택 사항이라 사용자 판단에 맡김. Notion 이름 원복 완료(사용자 확인, 2026-10-25). 배포본에는 다음 5분 창 뒤 반영됨
