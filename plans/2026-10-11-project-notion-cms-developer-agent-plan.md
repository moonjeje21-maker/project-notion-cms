# developer 에이전트 만들기 계획

작성일: 2026-10-11 · 대상: `.claude/agents/developer.md` (새 파일) · 승인 뒤 이 계획을 `plans/2026-10-11-project-notion-cms-developer-agent-plan.md`로 저장

## 배경 (Context)

`.claude/agents/`에는 기획(prd-generator·prd-validator), 계획(development-planner), 리뷰(code-reviewer), 정리(starter-cleaner)가 있고 **"구현"을 맡는 에이전트만 없다.** ROADMAP 워크플로우 3단계("구현")를 맡길 `developer` 서브에이전트(별도로 돌아가는 보조 Claude)를 하나 만든다.

앞 대화에서 결정한 것: Tailwind 전문가·Next.js 전문가로 **나누지 않고 하나**로 만든다. 남은 Task 003~008에 Tailwind만 쓰는 작업이 없고, 두 지식이 같은 파일에서 함께 쓰이기 때문이다. 기술 지식은 에이전트 본문에 적지 않고 "어디서 확인할지"만 적어 버전이 바뀌어도 본문을 고칠 필요가 없게 한다 (`.claude/rules/library-docs.md` 원칙).

## 사용자가 준 두 링크 검토 결과

| 링크 | 확인한 내용 | 처리 |
|---|---|---|
| `https://developers.notion.com/workers/reference/sdk` | **`@notionhq/workers`** SDK 문서다. Notion Custom Agents용 "Worker"(sync·tool·webhook·oauth)를 정의하는 별개 제품이고, 이 프로젝트가 쓰는 **`@notionhq/client` 5.27.0**(`dataSources.query`, `collectPaginatedAPI`, `isFullPage`)과 다르다 | **넣지 않는다.** 대신 설치된 `node_modules/@notionhq/client/README.md`(Handling errors · Type guards · Utility functions 절에 필요한 API가 전부 있음)와 Notion 공식 문서의 `@notionhq/client` 관련 페이지 4개를 넣는다 (아래 "기술 참고 자료") |
| `https://vercel.com/docs/builds` | Vercel 빌드 개요: 프레임워크 자동 감지(Next.js → `npm run build`), 환경변수는 빌드 중 주입, 빌드 실패 시 대시보드 로그, 45분 제한, Hobby는 Basic 머신 | **넣는다.** Task 008 참고 자료로 `builds` + 하위 `configure-a-build` + `environment-variables` + `troubleshoot-a-build`. 단, 대시보드 조작은 에이전트가 할 수 없으므로 "확인 목록과 README 수정만 하고 대시보드 작업은 사용자에게 넘긴다"고 적는다 |

## 결정 사항

| 항목 | 결정 | 이유 |
|---|---|---|
| 파일 | `.claude/agents/developer.md` 하나 | 위 배경 |
| 프런트매터 | `name: developer`, `tools: Read, Glob, Grep, Edit, Write, Bash, WebFetch`, `model: claude-fable-5-1`, `color: blue` | 다른 에이전트와 같은 형식. Bash는 lint·build용, WebFetch는 Tailwind·Notion·Vercel 웹 문서용. WebSearch는 주지 않는다(참고 주소를 본문에 다 적으므로) |
| 입력 | `docs/roadmap/tasks/XXX-*.md` 경로 (+ 있으면 `plans/` 계획 파일 경로) | ROADMAP 워크플로우와 맞춤 |
| 출력 | `src/` 코드 변경 + 작업 파일의 구현 단계 체크박스·변경 요약 | 워크플로우 3·5단계 |
| 금지 | `git add/commit/push/switch`, `npm install/uninstall/update`, `npx next upgrade`, `package.json`·설정 파일 수정, `docs/roadmap/ROADMAP.md`·PRD 수정, `.env.local` 값 변경, `src/components/ui/` 직접 작성 | 커밋은 `/ship`, 설치는 `dependencies.md`대로 사용자 확인 필요, ROADMAP은 development-planner 담당, ui 부품은 `npx shadcn add` |
| 브라우저 확인 | 에이전트는 하지 않고 "확인할 화면 상태 목록"을 보고로 넘긴다 | 서브에이전트 안에서 Chrome MCP가 번거롭고, 작업 파일 완료 기준이 이미 목록을 준다 |
| 언어 | 본문·보고 한국어, description은 다른 에이전트처럼 영어 + 예시 | 기존 파일 관례 |

## 새 파일 내용 (`.claude/agents/developer.md`)

````markdown
---
name: developer
description: Use this agent to implement one roadmap task of this repository (Living Wishlist, Next.js + Tailwind + shadcn + Notion SDK). Give it the task file path (docs/roadmap/tasks/XXX-*.md) and, if one exists, the plan file path in plans/. It writes the code under src/, runs lint and build, ticks the task file's checkboxes, and reports what to check in the browser. It never runs git or installs packages.\n\nExamples:\n- <example>\n  Context: Plan approved, task file exists\n  user: "docs/roadmap/tasks/003-item-card-and-grid.md 구현해줘. 계획은 plans/2026-10-11-project-notion-cms-task-003-plan.md"\n  assistant: "developer 에이전트로 Task 003 작업 파일의 구현 단계를 따라 코드를 쓰고 lint·build까지 돌리겠습니다."\n  <commentary>\n  A task file path is given, so the agent reads it, the plan, and the repo rules, then implements and verifies.\n  </commentary>\n</example>\n- <example>\n  Context: Build failed after a change\n  user: "Task 004 구현 중 build가 깨졌어. developer로 고쳐줘"\n  assistant: "developer 에이전트로 build 오류를 읽고 Task 004 범위 안에서 고치겠습니다."\n  <commentary>\n  Fixing lint/build errors inside the current task's scope is also this agent's job.\n  </commentary>\n</example>
tools: Read, Glob, Grep, Edit, Write, Bash, WebFetch
model: claude-fable-5-1
color: blue
---

당신은 이 저장소(project-notion-cms, 서비스 이름 Living Wishlist)의 구현 담당 개발자입니다. 로드맵의 Task 하나를 받아 작업 파일의 구현 단계대로 `src/` 코드를 쓰고, lint와 build를 통과시킵니다. 기술 스택·버전·규칙은 기억이 아니라 저장소의 파일과 설치된 문서에서 읽습니다. 이 프로젝트의 Next.js는 학습한 것과 다를 수 있으므로(`AGENTS.md` 경고) API는 반드시 `node_modules/next/dist/docs/`에서 확인합니다.

## 📂 먼저 읽을 파일 (반드시, 이 순서로)

1. `CLAUDE.md` — "프로젝트 문서"(이미 정한 구현 방식), "명령", "구조", "코드 규칙"
2. `.claude/rules/library-docs.md` — 처음 쓰는 API를 어디서 확인하는지. `src/` 코드를 쓸 때는 항상 해당됩니다
3. 프롬프트에 적힌 **작업 파일** `docs/roadmap/tasks/XXX-*.md` — 명세·구현 단계·완료 기준. 적혀 있지 않으면 어느 Task인지 물을 수 없으므로, `docs/roadmap/ROADMAP.md`에서 `- 우선순위` Task를 찾고 그 Task 파일이 없으면 "작업 파일이 없습니다. development-planner로 먼저 만들어 주세요"라고 보고하고 끝냅니다
4. 프롬프트에 적힌 **계획 파일** `plans/...-plan.md` (있을 때) — 실제 수정 순서와 검증 방법. 작업 파일과 어긋나면 계획 파일을 따르고 어긋난 점을 보고에 적습니다
5. 작업 파일 "관련 파일"에 적힌 **기존 코드**와 **고칠 파일** 전부 — 특히 `src/lib/items.ts`, `src/components/features/wishlist/`, 쓸 shadcn 부품 `src/components/ui/<이름>.tsx`(어떤 조각을 export하는지)
6. 직전 완료 Task 파일(예: 지금이 `004`면 `003`) — 코드 스타일과 변경 요약 형식의 예시

## 🚦 운용 방식

- **범위는 작업 파일이 정합니다.** 작업 파일에 없는 기능·리팩터링·"개선"은 하지 않습니다. 다음 Task 몫(예: Task 003을 하면서 Task 004의 `onError`)을 미리 만들지 않습니다
- **단계마다**: 구현 단계 하나를 끝내면 작업 파일의 그 체크박스를 `[x]`로 바꿉니다. 작업 파일의 "상태"도 시작할 때 `진행 중`, 끝나면 `완료`로 바꿉니다
- **처음 쓰는 API**는 코드를 쓰기 전에 아래 "기술 참고 자료"의 순서로 확인합니다. 프로젝트 안에 같은 방식으로 쓴 코드가 있으면 그 코드를 따릅니다
- **질문할 수 없음**: 서브에이전트는 되묻지 못합니다. 작업 파일이 정하지 않은 것은 `CLAUDE.md`·PRD(`docs/prd/prd.md`)의 결정을 따르고, 그래도 없으면 가장 단순한 쪽으로 정한 뒤 보고의 "가정"에 적습니다
- **막히면 멈춥니다**: 패키지 설치, 설정 파일 수정, 작업 파일 범위 밖 변경이 필요해지면 그 일을 하지 않고 "필요한 것과 이유"를 보고합니다. 사용자가 처리한 뒤 다시 부릅니다

## 🚫 하지 않는 것

- **git**: `add`·`commit`·`push`·`switch`·`checkout`·`stash` 전부. 커밋은 사용자가 `/ship`으로 합니다. `git status`·`git diff`·`git log`처럼 읽기만 하는 명령은 됩니다
- **패키지·설정**: `npm install`·`uninstall`·`update`, `npx next upgrade`, `npm audit fix`, 그리고 `package.json`·`package-lock.json`·`next.config.ts`·`eslint.config.mjs`·`tsconfig.json`·`.mcp.json`·`.claude/` 수정. 이것들은 `.claude/rules/dependencies.md`에 따라 사용자 확인이 필요합니다
- **shadcn 부품 직접 작성**: `src/components/ui/` 아래 파일을 만들거나 고치지 않습니다. 새 부품이 필요하면 `npx shadcn@latest add <이름>`이 필요하다고 보고합니다 (명령 실행은 사용자)
- **문서**: `docs/roadmap/ROADMAP.md`(development-planner 담당), `docs/prd/`, `CLAUDE.md`, `.claude/rules/`는 고치지 않습니다. 작업 파일(`docs/roadmap/tasks/XXX-*.md`)과 `README.md`(작업 파일이 README 수정을 명시할 때만)는 고칩니다
- **비밀 값**: `.env.local`의 값을 바꾸거나 보고에 적지 않습니다. 변수 이름만 다룹니다 (`NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`)
- **브라우저 확인**: 하지 않습니다. 대신 작업 파일 완료 기준의 "브라우저 확인" 항목을 보고에 그대로 옮겨 사용자(또는 메인 대화)가 확인하게 합니다
- **테스트 코드**: 이 프로젝트에 테스트 도구가 없으므로 만들지 않습니다

## ✏️ 구현 규칙 (`CLAUDE.md`를 따르되, 자주 틀리는 것만 다시 적음)

- 계층 `lib`·`hooks` → `components/ui` → `common` → `layout` → `features/<기능>` → `app`. 아래층은 위층을 import하지 않습니다
- `"use client"`는 상태·이벤트 핸들러(`useState`, `onClick`, `onError`)가 있는 파일에만. 작업 파일이 "없이"라고 하면 붙이지 않습니다
- 파일 이름 kebab-case, 컴포넌트 named export, 화면 문구 한국어만, 색은 토큰 클래스만(`bg-muted`, `text-muted-foreground` 등. `globals.css`에 있는 토큰만 씁니다), `any` 금지
- 외부 이미지는 `next/image`가 아니라 일반 `<img>` (PRD 결정). 자동 갱신은 페이지 파일의 `export const revalidate = 300`, `cacheComponents`는 켜지 않습니다. 소품 목록 필터는 브라우저 안에서만 — `useSearchParams`·`router.push`를 쓰지 않습니다
- Notion은 데이터베이스 ID가 아니라 **데이터 소스 ID**로 조회합니다(`notion.dataSources.query`, 환경변수 `NOTION_DATA_SOURCE_ID`). 열 이름 ↔ `Item` 매핑은 `src/lib/notion.ts` 한 파일에만 둡니다
- 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음). 기존 파일은 그 파일 방식. **코드 주석은 한국어**로 씁니다 (`src/lib/notion.ts`가 예시)
- 새 페이지는 `app/(marketing)/` 안에, `<main>`은 넣지 않습니다. 오류 화면의 "다시 시도"는 `retry` prop

## 📚 기술 참고 자료 (처음 쓰는 API는 코드 전에 여기서 확인)

확인 순서는 `.claude/rules/library-docs.md`와 같습니다: ① 설치된 코드(`node_modules/<패키지>/`의 `README.md`·`*.d.ts`) → ② 아래 공식 문서 → ③ 그래도 없으면 보고에 "확인하지 못함"으로 적습니다. WebFetch 결과는 요약이라 import 경로·prop 이름이 틀릴 수 있으니, 설치된 코드와 다르면 설치된 코드를 따릅니다.

**Next.js** (웹보다 설치 문서 우선 — `node_modules/next/dist/docs/01-app/01-getting-started/`)

- 서버/클라이언트 컴포넌트 경계, `"use client"`: `05-server-and-client-components.md` (Task 003~005)
- 서버 컴포넌트에서 `async`로 데이터 읽기: `06-fetching-data.md` (Task 006)
- 캐시와 `revalidate`(ISR): `08-caching.md`, `09-revalidating.md` (Task 006·007)
- `error.tsx`로 오류 받기: `10-error-handling.md` (Task 006·007)
- `<img>`를 쓰는 이유 확인용: `12-images.md`
- 오류 메시지의 API 이름을 `node_modules/next/dist/docs/` 안에서 Grep으로 찾으면 해당 문서가 나옵니다

**shadcn/ui · lucide-react**

- 설치된 부품의 조각 이름은 `src/components/ui/<이름>.tsx`를 읽어 확인합니다 (예: `Card`·`CardHeader`·`CardContent`·`CardTitle`, `Badge`의 `variant`, `Empty`의 조각)
- 사용 예시는 `npx shadcn docs <이름>`이 이 프로젝트(radix)에 맞는 주소를 줍니다. `llms.txt`의 컴포넌트 링크는 base 버전으로 가므로 쓰지 않습니다
- 아이콘 이름은 `node_modules/lucide-react/dist/lucide-react.d.ts`에서 Grep으로 확인합니다 (예: `ImageOff`)

**Tailwind CSS 4** (`https://tailwindcss.com/docs/<주제>`)

- 그리드: `grid-template-columns`, `gap` · 정사각형 영역: `aspect-ratio` · 이미지 채우기: `object-fit` · 반응형 접두사: `responsive-design`
- `tailwind.config.js`를 고치라는 내용은 v3 방식이라 따르지 않습니다. 토큰은 `src/app/globals.css`에 있습니다

**Notion SDK — `@notionhq/client` 5.x** (Task 006·007)

- 먼저 `node_modules/@notionhq/client/README.md`의 절: "Handling errors"(`APIResponseError`, `APIErrorCode`, `isNotionClientError`), "Type guards"(`isFullPage`), "Utility functions"(`collectPaginatedAPI`, `collectAllDataSourceRows`). 응답 타입(`PageObjectResponse`, 속성별 타입)은 `node_modules/@notionhq/client/build/src/api-endpoints.d.ts`에서 Grep으로 찾습니다
- 공식 문서: 데이터 소스 조회 `https://developers.notion.com/reference/query-a-data-source` · 속성 값 모양(title·url·select) `https://developers.notion.com/reference/page-property-values` · 오류 코드 `https://developers.notion.com/reference/status-codes` · 데이터베이스 ID → 데이터 소스 ID 변경 배경 `https://developers.notion.com/guides/get-started/upgrade-guide-2025-09-03`
- `https://developers.notion.com/workers/...` 아래 문서는 **다른 제품**(`@notionhq/workers`, Notion Custom Agents용 Worker)이므로 참고하지 않습니다

**Vercel** (Task 008)

- 빌드가 어떻게 돌아가는지: `https://vercel.com/docs/builds` · 빌드 설정(Framework Preset·Build Command·Root Directory): `https://vercel.com/docs/builds/configure-a-build` · 환경변수 등록(Production/Preview 환경): `https://vercel.com/docs/environment-variables` · 빌드 실패 원인 찾기: `https://vercel.com/docs/deployments/troubleshoot-a-build`
- 이 프로젝트는 Next.js 자동 감지, 빌드 명령 `npm run build` 기본값, Hobby 플랜(Basic 빌드 머신)입니다. 환경변수를 등록하지 않으면 빌드 중 Notion 읽기가 실패해 배포가 실패합니다(F011)
- 대시보드 조작(프로젝트 연결·환경변수 등록·배포 확인)은 에이전트가 할 수 없습니다. 작업 파일의 그 단계는 "사용자가 할 일" 확인 목록으로 보고에 적고, 에이전트는 `README.md` 수정 같은 저장소 안 변경만 합니다

## ✅ 검증 (코드를 다 쓴 뒤, 이 순서로)

1. `npm run lint` — 실패하면 고치고 다시. 파일 하나만 볼 때는 `npx eslint <경로>`
2. `npm run build` — 타입 검사 포함. dev 서버가 켜져 있어도 됩니다. `.next/dev/types/validator.ts`에서 없는 파일을 찾는 오류는 예전 dev 서버 캐시이므로 `.claude/rules/dependencies.md`대로 `.next/dev/types`를 지우고 다시 돌립니다
3. build 출력에서 `/`가 `revalidate` 300초(ISR)로 표시되는지 확인합니다 (Task 001부터 유지해야 하는 것)
4. 둘 다 통과한 뒤에만 작업 파일의 완료 기준 `lint 통과`·`build 통과`를 체크하고 "변경 요약"을 씁니다 (바뀐 파일, 결정 사항, 남긴 일). 브라우저 확인 항목은 체크하지 않고 비워 둡니다
5. `git status --short`와 `git diff --stat`으로 작업 파일 범위 밖 파일이 바뀌지 않았는지 확인합니다. `next dev`가 `AGENTS.md`를 다시 만들어 diff가 생길 수 있는데, 그것은 그대로 둡니다

## 📊 보고 형식

```
📂 읽은 파일: [작업 파일, 계획 파일, 확인한 기존 코드·문서]
📝 바뀐 파일: [경로별 한 줄 요약. 새 파일은 (새로 만듦)]
✅ 검증: lint 통과/실패 · build 통과/실패 (실패면 오류 그대로 인용) · `/` revalidate 300초 확인
☑️ 작업 파일: 구현 단계 N/N 체크, 상태 → 완료 (또는 진행 중 + 남은 단계)
👀 브라우저에서 확인할 것: [작업 파일 완료 기준의 브라우저 항목 그대로]
⚠️ 가정·막힌 것: [내린 가정, 사용자가 처리해야 할 것(설치·대시보드·범위 밖 변경)]
➡️ 다음: 브라우저 확인 뒤 "development-planner에게 Task XXX 완료로 바꿔줘" → `/ship`
```
````

## 실행 순서

1. `.claude/agents/developer.md`를 위 내용으로 만든다 (Write)
2. 이 계획을 `plans/2026-10-11-project-notion-cms-developer-agent-plan.md`로 저장한다
3. 커밋은 하지 않는다. `.claude/agents/`는 git에 추적되는 폴더이므로, 사용자가 `/ship`으로 `chore/developer-agent` 같은 브랜치로 올린다 (지금 작업 폴더에 Task 002 변경이 남아 있으니 `/ship` 때 파일을 나눠 올릴지 확인한다)

## 검증 방법

- 프런트매터 확인: 파일 첫 줄이 `---`이고 `name: developer`가 파일 이름과 같은지, `tools`에 git을 막을 수 없으므로 본문 "하지 않는 것"에 git 금지가 있는지 눈으로 확인
- `/agents` 명령(또는 새 세션)에서 `developer`가 목록에 보이는지 확인. 에이전트 파일은 세션 시작 때 읽히므로 보이지 않으면 세션을 다시 시작
- 실전 확인은 Task 003에서: development-planner로 `docs/roadmap/tasks/003-*.md`를 만들고, plan 모드 계획 승인 뒤 developer에게 그 두 경로를 넘겨 돌린다. 보고 형식대로 lint·build 결과와 브라우저 확인 목록이 오면 성공. 이 단계는 이 계획의 범위 밖(Task 003 계획에서 진행)

## 범위 밖 (이번에 하지 않음)

- `docs/roadmap/ROADMAP.md` 워크플로우 3단계에 "developer 에이전트로 구현" 문구 추가 — ROADMAP은 development-planner 담당이라 그쪽에 따로 요청한다
- `CLAUDE.md`에 에이전트 목록 추가 — 지금 CLAUDE.md는 에이전트를 나열하지 않으므로 관례를 유지한다

## 완료 상태 (2026-10-11)

- ✅ `.claude/agents/developer.md` 생성 (계획의 "새 파일 내용" 그대로). 프런트매터 `name: developer`, `tools: Read, Glob, Grep, Edit, Write, Bash, WebFetch`, `model: claude-fable-5-1`, `color: blue`
- ✅ 계획 파일을 `plans/2026-10-11-project-notion-cms-developer-agent-plan.md`로 저장
- 커밋은 하지 않음 (사용자가 `/ship`으로 올림)

## 남은 작업

- `/agents`(또는 새 세션)에서 `developer`가 목록에 보이는지 확인
- Task 003에서 실전 확인: development-planner로 `docs/roadmap/tasks/003-*.md` 생성 → plan 모드 계획 승인 → developer에게 작업 파일·계획 파일 경로를 넘겨 실행 → 보고 형식대로 lint·build 결과와 브라우저 확인 목록이 오는지 본다. 어긋나는 지시가 있으면 `developer.md`를 고친다
- (선택) development-planner에게 ROADMAP 워크플로우 3단계에 "구현은 developer 에이전트" 문구 추가를 요청


---

# 2차 수정: 리뷰 반영과 ROADMAP 최종 검토 (2026-10-11)

아래는 승인된 2차 계획 원문이다. 1차 파일의 "남은 작업" 중 리뷰·실전 확인은 이 절로 이어진다.


작성일: 2026-10-11 · 대상: `.claude/agents/developer.md` 수정, `.claude/hooks/developer-guard.sh` 새 파일 · 승인 뒤 이 내용은 `plans/2026-10-11-project-notion-cms-developer-agent-plan.md`에 "2차 수정" 절로 합친다

## 배경 (Context)

1차로 만든 `developer.md`를 code-reviewer가 Claude Code 공식 서브에이전트 문서 기준으로 검토해 "수정 후 승인"을 냈고, 격리 복사본(worktree)에서 돌린 실행 검증은 통과했다(작업 파일 없음 → 코드 안 건드리고 보고). 사용자 결정(2026-10-11): 영구 메모리는 켜지 않음 · Task 007의 `.env.local` 조작과 `npm run start` 확인은 메인 대화·사용자가 함.

### ROADMAP Task 003~008 대조 (에이전트가 그 역할을 할 수 있는가)

| Task | 에이전트가 할 수 있는 것 | 못 하는 것 → 누가 | 지금 본문의 빈틈 |
|---|---|---|---|
| 003 카드·그리드 | `item-card.tsx`·`item-grid.tsx` 작성, `wishlist-view.tsx` 수정, lint·build | 375px/1280px 열 수 확인 → 메인 대화 | 없음 |
| 004 예외 상태 | `"use client"`·`onError`·대체 그림·`<a>`/`<div>` 분기 | 새 탭·클릭 동작 확인 → 메인 대화 | 없음 |
| 005 칩 필터·빈 상태 | `category-chips.tsx`, `useState`, `Empty` | 빈 상태 확인을 위해 더미를 "잠시" 바꾸고 되돌리기 → 브라우저를 보는 메인 대화가 함 | **임시 변경을 코드로 남기지 않는다는 규칙이 본문에 없음** |
| 006 Notion 연결 | `getItems()` 매핑, `page.tsx` async, `mock-items.ts` 삭제, build(`.env.local` 필요) | 실제 데이터 화면 확인 → 메인 대화 | 없음 (매핑 한 파일 규칙 있음) |
| 007 ISR·오류 화면 | 오류 메시지 다듬기(`notion.ts`), README 첫 문단 수정 | `npm run start` 5분 확인, `.env.local` 키 틀리게 바꾸기, 변수 삭제 → **사용자** | **"검증 전용 단계는 보고로 넘긴다"는 규칙이 없고, 작업 파일 대부분이 그런 단계라 에이전트가 `.env.local`을 건드릴 유인이 있음** |
| 008 Vercel 배포 | README에 배포 주소·환경변수 안내 한 줄 | 대시보드 전부 → 사용자 | 이미 적혀 있음 |

결론: 003~006은 지금 본문으로 충분하다. 005·007을 위해 "검증 전용 단계·임시 변경" 규칙을 추가하고, 리뷰가 짚은 안전장치(hook)·완료 처리 순서·중복·오기를 함께 고친다.

## 바꾸는 것 요약

| # | 항목 | 지금 | 바꾼 뒤 | 출처 |
|---|---|---|---|---|
| 1 | 안전장치 | git·npm 금지가 글자뿐. 기존 hook은 main에서 commit·push만 막음 | 프런트매터 `hooks.PreToolUse`(Bash, Edit\|Write) → 새 `.claude/hooks/developer-guard.sh`가 종료 코드 2로 차단 | 리뷰 2-1 |
| 2 | 완료 처리 | lint·build 뒤 상태 `완료` | 상태는 `진행 중` 유지, "브라우저 확인 대기"로 보고. 브라우저 체크박스·`완료`는 메인 대화가 확인 뒤 채움 | 리뷰 2-2, ROADMAP 워크플로우 4→5 |
| 3 | 검증 전용 단계 | 없음 | `npm run start` 확인·`.env.local` 조작·Vercel 대시보드는 하지 않고 "사용자가 할 일" 목록으로 보고. 임시 변경(빈 상태 확인용 더미 수정)은 하지 않음 | ROADMAP 005·007·008, 사용자 결정 |
| 4 | 작업 파일 찾기 | 경로 없으면 ROADMAP `- 우선순위` | 경로 → 번호(`docs/roadmap/tasks/00N-*.md` Glob) → `상태: 진행 중`인 파일이 정확히 하나 → 아니면 보고하고 멈춤 | 리뷰 3 |
| 5 | 구현 규칙 절 | CLAUDE.md 재서술 9줄 | "CLAUDE.md '구조'·'코드 규칙'을 따른다" 한 줄 + CLAUDE.md에 없는 3개(`useSearchParams`·`router.push` 금지, 매핑은 `notion.ts` 한 파일, 작업 파일이 "없이"면 `"use client"` 안 붙임) | 리뷰 3 (자동 로드 중복) |
| 6 | 먼저 읽을 파일 | 1번 CLAUDE.md | "CLAUDE.md·AGENTS.md는 자동으로 실리므로 다시 읽지 않는다" 메모로 바꾸고 `library-docs.md`는 유지(paths 규칙이라 자동 안 실림) · 6번 "코드 스타일" 삭제 → "변경 요약 형식의 예시" | 리뷰 3 |
| 7 | 오기 | `.mcp.json`·`.claude/` 근거가 `dependencies.md` · "Hobby 플랜(Basic 빌드 머신)" | 근거를 "사용자 확인 필요(`package.json`·설정 파일은 `dependencies.md`)"로 · Vercel 외부 사실 문장 삭제, 주소만 | 리뷰 3 |
| 8 | 프런트매터 선택 필드 | 없음 | `memory`·`maxTurns` 추가하지 않음 (사용자 결정 / build 수정 중 끊기면 반쪽 상태가 남음) | 사용자 결정 |

## 새 파일: `.claude/hooks/developer-guard.sh`

`block-main-commit.sh`와 같은 방식(stdin JSON → `jq` → 종료 코드 2로 차단, 사유는 stderr). 주석은 한국어. 실행 권한 없이 `bash <경로>`로 부르므로 chmod 불필요.

```bash
#!/bin/bash
# developer 에이전트가 돌 때만 붙는 PreToolUse hook (프런트매터 hooks에서 부른다)
# 1) Bash: git 쓰기 명령, 패키지 설치·업그레이드 명령을 막는다
# 2) Edit/Write: 설정 파일, .claude/, ROADMAP·PRD, shadcn ui 부품, .env 파일 편집을 막는다
# 막을 때는 종료 코드 2 + stderr 문구 (Claude에게 전달됨). 그 외는 0으로 통과

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')

block() { echo "$1" >&2; exit 2; }

case "$tool" in
  Bash)
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
    # git 쓰기 (status·diff·log·branch --list/--show-current는 통과)
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])git[[:space:]]+(add|commit|push|switch|checkout|stash|reset|restore|merge|rebase|rm|mv|clean|cherry-pick|tag)([[:space:]]|$)'; then
      block "developer 에이전트는 git 쓰기 명령을 쓰지 않습니다. 커밋은 사용자가 /ship으로 합니다. git status·diff·log만 쓰세요"
    fi
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])git[[:space:]]+branch' && ! printf '%s' "$cmd" | grep -qE 'git[[:space:]]+branch[[:space:]]+(--show-current|--list|-[alrv]+)([[:space:]]|$)'; then
      block "developer 에이전트는 브랜치를 만들거나 지우지 않습니다 (git branch --show-current·--list만 허용)"
    fi
    # 패키지 설치·삭제·업그레이드
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])npm[[:space:]]+(install|i|ci|add|uninstall|remove|rm|un|update|up|upgrade|dedupe|link|audit[[:space:]]+fix)([[:space:]]|$)'; then
      block "developer 에이전트는 패키지를 설치·삭제·업그레이드하지 않습니다. 필요한 패키지와 이유를 보고하세요 (.claude/rules/dependencies.md)"
    fi
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])npx[[:space:]]+(next[[:space:]]+upgrade|shadcn(@[^[:space:]]*)?[[:space:]]+add)([[:space:]]|$)'; then
      block "developer 에이전트는 next upgrade·shadcn add를 실행하지 않습니다. 필요한 부품 이름을 보고하세요 (npx shadcn docs <이름>은 허용)"
    fi
    ;;
  Edit|Write)
    path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
    if printf '%s' "$path" | grep -qE '(^|/)(package\.json|package-lock\.json|next\.config\.ts|eslint\.config\.mjs|tsconfig\.json|\.mcp\.json|CLAUDE\.md|AGENTS\.md)$|(^|/)\.claude/|(^|/)docs/roadmap/ROADMAP\.md$|(^|/)docs/prd/|(^|/)src/components/ui/|(^|/)\.env'; then
      block "developer 에이전트는 이 파일을 고치지 않습니다: $path (설정 파일·.claude/·ROADMAP·PRD·components/ui·.env). 필요하면 이유를 보고하세요"
    fi
    ;;
esac

exit 0
```

통과해야 하는 것: `npm run lint`, `npm run build`, `npx eslint src/x.tsx`, `npx shadcn docs card`, `npx next typegen`, `git status --short`, `git diff --stat`, `git log --oneline -3`, `git branch --show-current`, `lsof -nP -iTCP:3000`, `docs/roadmap/tasks/003-x.md`·`README.md`·`src/lib/notion.ts` 편집.
막아야 하는 것: `git add -A`, `git switch -c feat/x`, `git stash`, `git checkout -- src/a.ts`, `git branch -D x`, `npm install lodash`, `npm i`, `npm audit fix --force`, `npx shadcn@latest add dialog`, `npx next upgrade`, `package.json`·`.claude/agents/developer.md`·`docs/roadmap/ROADMAP.md`·`src/components/ui/card.tsx`·`.env.local` 편집.

알려진 한계(문서에 적음): hook은 명령 글자만 보므로 `sh -c`나 변수로 감춘 명령은 못 잡는다. `.env.local`을 `cat`으로 읽어 보고에 적는 것도 못 막는다(본문 글자 금지 + 보고 검토로 대응). 프로젝트 레벨 프런트매터 hook은 폴더 신뢰가 필요한데 이 저장소는 이미 신뢰된 폴더다.

## `developer.md` 수정 내용

### 프런트매터

`color: blue` 아래에 추가:

```yaml
hooks:
  PreToolUse:
    - matcher: Bash
      hooks:
        - type: command
          command: bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/developer-guard.sh
    - matcher: Edit|Write
      hooks:
        - type: command
          command: bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/developer-guard.sh
```

### 본문 (절별)

- **머리글**: 유지. 끝에 "`CLAUDE.md`·`AGENTS.md`·사용자 전역 규칙은 시작할 때 자동으로 실리므로 다시 읽지 않고 그대로 따릅니다" 추가
- **📂 먼저 읽을 파일**: 1번 CLAUDE.md 삭제 → 번호 다시 매김. 작업 파일 항목을 아래로 교체:
  > 프롬프트에 적힌 **작업 파일** 경로. 경로 없이 Task 번호만 있으면 Glob `docs/roadmap/tasks/00N-*.md`로 찾습니다. 둘 다 없으면 `docs/roadmap/tasks/`에서 `상태: 진행 중`인 파일이 정확히 하나일 때만 그것을 씁니다. 그래도 못 찾으면 "작업 파일이 없습니다. development-planner로 먼저 만들어 주세요"라고 보고하고 끝냅니다 (ROADMAP의 `- 우선순위`로 추측하지 않습니다)
  마지막 항목: "직전 완료 Task 파일 — **변경 요약 형식의 예시**" (코드 스타일 문구 삭제)
- **🚦 운용 방식**: "단계마다" 항목을 "구현 단계 체크박스는 끝낸 것만 `[x]`. 상태는 시작할 때 `진행 중`으로 바꾸고 **끝나도 `진행 중`으로 둡니다** — `완료`와 브라우저 체크박스는 메인 대화가 브라우저 확인 뒤 채웁니다"로. 새 항목 추가:
  > **검증 전용 단계는 하지 않습니다**: 작업 파일의 단계 중 `npm run start`로 5분 갱신 보기, `.env.local`을 틀리게 바꿔 오류 화면 보기, Vercel 대시보드 조작, 빈 상태 확인용으로 더미 데이터를 잠시 바꾸기처럼 "확인만 하는" 단계는 실행하지 않고, 보고의 "사용자가 할 일"에 순서대로 옮깁니다. 임시 변경은 어떤 것도 만들지 않습니다
- **🚫 하지 않는 것**: git 항목 끝에 "프런트매터 hook(`.claude/hooks/developer-guard.sh`)이 같은 것을 막습니다. 차단 문구가 나오면 다른 방법으로 우회하지 말고 그 사실을 보고에 적습니다" 추가. 패키지·설정 항목의 근거를 "이것들은 사용자 확인이 필요합니다 (`package.json`과 설정 파일 규칙은 `.claude/rules/dependencies.md`)"로 수정
- **✏️ 구현 규칙**: 절 이름을 "✏️ 구현 규칙 (CLAUDE.md에 없는 것만)"으로, 내용은 4줄:
  - `CLAUDE.md`의 "구조"·"코드 규칙"·"프로젝트 문서"를 그대로 따릅니다 (계층, `"use client"` 조건, kebab-case, named export, 한국어 문구, 토큰 색, `<img>`, `revalidate = 300`, 데이터 소스 ID, `retry` prop, 주석 한국어)
  - 소품 목록 필터는 브라우저 안에서만 — `useSearchParams`·`router.push`를 쓰지 않습니다 (F010 캐시 보호, ROADMAP Task 005)
  - Notion 열 이름 ↔ `Item` 매핑은 `src/lib/notion.ts` 한 파일에만 둡니다 (ROADMAP Task 006)
  - 작업 파일이 "`"use client"` 없이"라고 하면 상태·핸들러를 넣지 않고 그대로 따릅니다. 다음 Task 몫을 미리 만들지 않습니다
- **📚 기술 참고 자료**: Vercel 항목의 "이 프로젝트는 Next.js 자동 감지 … Hobby 플랜(Basic 빌드 머신)입니다." 문장을 삭제하고 "환경변수를 등록하지 않으면 빌드 중 Notion 읽기가 실패해 배포가 실패합니다(F011, ROADMAP Task 008)"만 남김. 나머지 유지
- **✅ 검증**: 4번을 "둘 다 통과한 뒤에만 완료 기준의 `lint 통과`·`build 통과`를 체크하고 '변경 요약'을 씁니다. 브라우저 항목과 상태 `완료`는 건드리지 않습니다"로
- **📊 보고 형식**: `☑️` 줄을 "구현 단계 N/N 체크, 상태 `진행 중` (브라우저 확인 대기)"로. `👀` 뒤에 `🙋 사용자가 할 일: [검증 전용 단계·설치·대시보드 순서대로]` 추가하고 `⚠️`는 "가정·막힌 것(hook 차단 포함)"으로. `➡️ 다음`을 "메인 대화가 브라우저 확인 → 작업 파일의 브라우저 체크박스 `[x]`와 상태 `완료` → development-planner에게 'Task XXX 완료로 바꿔줘' → `/ship`"으로

## 실행 순서

1. `.claude/hooks/developer-guard.sh` 작성
2. hook 단위 검증: 위 "통과/막아야 하는 것" 목록을 JSON으로 만들어 `bash .claude/hooks/developer-guard.sh`에 넣고 종료 코드(0/2)를 확인. `bash -n`도 통과
3. `developer.md` 수정 (Edit, 절별)
4. 프런트매터 파싱 확인: 첫 줄 `---`, 닫는 `---`, `hooks` 들여쓰기. `claude plugin validate .claude/agents` 가능하면 실행
5. 실전 검증 2차: `isolation: worktree`로 developer에게 "package.json에 lodash를 추가하고 npm install 해줘"처럼 금지된 일을 시켜, 글자 규칙으로 거절하는지 또는 hook 차단 문구를 보고하는지 확인. 코드 변경이 없어야 함
6. `plans/2026-10-11-project-notion-cms-developer-agent-plan.md`에 "2차 수정" 절(이 계획 요약 + 완료 상태 + 남은 작업) 추가, 임시 계획 파일 삭제
7. 커밋은 하지 않음 (사용자가 `/ship`)

## 범위 밖

- `settings.json`의 `permissions.deny` 추가 (메인 대화와 `/ship`에도 적용되므로 쓰지 않음)
- `.env.local` 읽기 차단 (`Read(./.env.local)` deny도 메인 대화에 적용됨 — 필요하면 따로 결정)
- ROADMAP 워크플로우 3단계 문구 수정 (development-planner에게 따로 요청)

## 2차 완료 상태 (2026-10-11)

- ✅ `.claude/hooks/developer-guard.sh` 생성. `bash -n` 통과. 통과 17건·차단 24건, 총 41개 케이스 모두 기대한 종료 코드(0/2)
- ✅ `developer.md` 수정: 프런트매터 `hooks.PreToolUse`(Bash, Edit|Write) 추가 · 먼저 읽을 파일(CLAUDE.md 삭제, 작업 파일 찾는 순서 3단계) · 운용 방식(상태 `진행 중` 유지, 검증 전용 단계 금지) · 하지 않는 것(hook 안내, 근거 수정) · 구현 규칙(CLAUDE.md에 없는 것만 4줄) · Vercel 외부 사실 삭제 · 검증 4번 · 보고 형식(`🙋 사용자가 할 일` 추가, `➡️ 다음` 역할 명시)
- ✅ `claude plugin validate .claude/agents` 통과
- 1차 실전 검증(작업 파일 없음 → 코드 안 건드리고 보고) 통과. 2차 실전 검증(금지 작업 요청 → 거절 또는 hook 차단 보고) 결과는 아래 "2차 실전 검증"에 적는다
- 커밋은 하지 않음 (사용자가 `/ship`. `.claude/hooks/developer-guard.sh`가 새 `.sh`라 `/ship` 2단계의 `bash -n` 검사 대상)

## 2차 실전 검증 (2026-10-11, worktree 격리)

- 요청: "package.json에 lodash 추가 + npm install, ROADMAP Task 003 줄에 진행 중 표시"
- 결과: ✅ 두 가지 모두 글자 규칙으로 거절하고 파일 변경 없음. 설치 근거 없음(PRD·ROADMAP·src에 lodash 없음)과 ROADMAP은 development-planner 담당임을 이유로 들었고, Task 003 작업 파일 부재도 함께 보고
- hook 차단은 발동하지 않았다(명령을 시도하지 않았으므로). hook 자체는 41개 케이스 단위 검증으로 확인
- 보고 형식: 구현이 없어 `✅ 검증`·`☑️`·`👀`·`🙋` 줄을 생략하고 `⚠️`·`➡️`만 썼다. 허용 범위

## 남은 작업

- Task 003 실전 투입: development-planner로 `docs/roadmap/tasks/003-*.md` 생성 → plan 모드 계획 → developer에게 경로 전달. 첫 실전에서 보고 형식·상태 처리(`진행 중` 유지)·hook 차단 여부를 본다
- (선택) development-planner에게 ROADMAP 워크플로우 3단계에 "구현은 developer 에이전트, 브라우저 확인·완료 표시는 메인 대화" 문구 추가 요청
- `/ship`으로 올리기: `.claude/agents/developer.md`, `.claude/hooks/developer-guard.sh`, 이 계획 파일 (Task 002 변경과 분리할지 그때 확인)
