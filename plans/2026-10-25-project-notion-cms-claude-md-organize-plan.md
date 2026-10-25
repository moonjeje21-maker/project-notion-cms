# CLAUDE.md 정리 계획

작성일: 2026-10-25 · 기준: Claude Code 공식 문서 "How Claude remembers your project"의 CLAUDE.md 작성 지침

## Context (왜 하는가)

현재 `CLAUDE.md`(50줄, 3,054자)는 크기는 적당하지만 다음 문제가 있다.

- 맨 위에 **절 제목 없는 긴 글머리 2개**(Git 규칙 + "규칙 파일을 직접 읽어라")가 있다. Git 규칙 한 줄에 hook·`&&` 금지·ship 순서·영어 메시지·승인 규칙 다섯 가지가 뭉쳐 있어 한눈에 읽기 어렵다
- "작업 완료 체크리스트" 절 밑에 hook 동작 설명이 한 문단으로 붙어 있고, "명령" 절의 "테스트 도구는 없다…" 줄도 네 가지 사실이 한 줄에 들어 있다
- `# CLAUDE.md` + 영어 안내 문장 + `# project-notion-cms`로 H1이 둘이다
- 공식 지침은 "관련 지시를 머리글과 글머리로 묶고, 검증할 수 있을 만큼 구체적으로, 200줄 이하"를 권한다. 내용은 거의 맞으므로 **내용을 바꾸지 않고 구조만 정리**한다

문서에서 참고할 요점: 머리글·글머리로 묶기 / 코드로 알 수 있는 내용은 빼기 / `.claude/rules/`는 `paths`가 있으면 해당 파일을 Read·Edit·`cat`할 때만 실린다 / HTML 주석(`<!-- -->`)은 Claude에게 전달되지 않아 사람용 메모에 쓸 수 있다 / `@AGENTS.md` import는 그대로 둬도 두 번 읽히지 않는다

## 지켜야 할 제약 (조사 결과)

- **절 제목 5개는 바꾸지 않는다**: "프로젝트 문서"·"명령"·"구조"·"코드 규칙"은 `.claude/agents/developer.md`(50행)와 `development-planner.md`(13행)가, "작업 완료 체크리스트"는 `.claude/hooks/check-after-work.sh`(3행 주석)가 이름으로 가리킨다
- `.claude/rules/` 세 파일은 모두 `paths`가 있다 (`dependencies.md`: package.json·next.config.ts 등, `library-docs.md`: `src/**/*.ts(x)`·globals.css·package.json, `theme.md`: globals.css·layout.tsx). 따라서 "Bash 명령만 실행할 때는 안 실리므로 직접 읽는다"는 현재 문장은 맞다. 다만 `theme.md`는 CLAUDE.md에 언급이 없어 함께 적는다
- 현재 문장이 가리키는 것들은 모두 실제로 존재함을 확인했다: `npm run check-all`(package.json), `export const revalidate = 300`(`src/app/(marketing)/page.tsx`), `retry` prop(`src/app/error.tsx`), hook 3개, `/ship` 스킬, Playwright MCP(`.mcp.json`, `settings.local.json`에서 꺼짐)
- README.md에 hook 표·버전 표·폴더 그림이 이미 있으므로 CLAUDE.md는 "README에 있다"는 한 줄만 유지한다

## 수정 파일

`CLAUDE.md` 한 파일만 고친다. 다른 파일(`README.md`, `.claude/`, `docs/`)은 손대지 않는다.

## 새 CLAUDE.md 구성 (전문)

```markdown
<!-- 유지 안내(사람용 메모, Claude에게는 전달되지 않음)
- 이 파일에는 매 세션 필요한 규칙만 둔다. 특정 파일을 고칠 때만 필요한 주의는 .claude/rules/(paths 지정), 버전 표·화면 목록·폴더 그림·hook 표는 README.md에 둔다
- 절 제목 "프로젝트 문서"·"명령"·"작업 완료 체크리스트"·"구조"·"코드 규칙"은 .claude/agents/와 .claude/hooks/가 이름으로 가리키므로 바꾸지 않는다
- 200줄을 넘기지 않는다. 낡은 문장은 /doctor prompt-audit로 찾는다 -->

@AGENTS.md

# project-notion-cms

**Living Wishlist** — Notion 표에 적은 인테리어 소품을 카드 한 화면으로 보여 주는 읽기 전용 사이트. 정확한 버전, 화면 목록, 폴더 그림, 설치된 shadcn 컴포넌트, hook 표는 `README.md`에 있다.

## 프로젝트 문서

작업을 시작할 때 읽는다.

- 설계도: `docs/prd/prd.md`. 기능을 만들 때는 기능 ID F001~을 따른다
- 진행 상태와 다음 할 일: `docs/roadmap/ROADMAP.md`. Task 상세는 `docs/roadmap/tasks/`
- 세부 주의 사항은 `.claude/rules/`에 있고, 해당 파일을 Read·Edit할 때만 자동으로 실린다. Bash 명령만 실행할 때는 실리지 않으므로 직접 읽는다:
  - 라이브러리 설치·버전 올리기·`npm audit`·설정 파일 수정 전, build 캐시 오류 → `.claude/rules/dependencies.md`
  - 처음 쓰는 API, 라이브러리 설치·업그레이드 → `.claude/rules/library-docs.md`
  - 테마·글꼴(`globals.css`, `layout.tsx`) → `.claude/rules/theme.md`

PRD에서 정한 구현 방식 (바꾸지 않는다):

- Notion SDK 5.x는 데이터베이스 ID가 아닌 **데이터 소스 ID**로 조회한다. 환경변수는 `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`
- 자동 갱신은 `cacheComponents`를 켜지 않고 페이지 파일의 `export const revalidate = 300`으로 한다. 개발 서버에서는 캐시가 안 돌아 `npm run build && npm run start`로 확인한다
- 외부 이미지는 `next/image` 대신 일반 `<img>`를 쓴다

## 명령

- `npm run dev` — 개발 서버 (http://localhost:3000). 이미 켜져 있을 수 있으니 먼저 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 확인한다
- `npm run lint` — 전체 lint. 파일 하나만: `npx eslint src/app/layout.tsx`
- `npm run build` — 배포용 빌드 + 타입 검사 (lint는 돌리지 않는다). dev 서버를 켠 채로 돌려도 된다
- `npx next typegen && npx tsc --noEmit` — 타입 검사만 (typegen이 `LayoutProps` 같은 전역 타입을 만든다)
- `npm run check-all` — lint + typegen + tsc를 한 번에

변경 확인 (테스트 도구는 없다):

- lint + build + 브라우저(Claude in Chrome 또는 Playwright MCP)로 확인한다
- Playwright MCP는 `.mcp.json`에 있지만 `settings.local.json`에서 꺼 둘 수 있다. 안 보이면 그 때문이다
- 스크린샷은 `.playwright-mcp/이름.png`로 저장한다 (git이 무시하는 폴더)
- 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다

## 작업 완료 체크리스트

```bash
npm run check-all
npm run build
```

- 턴이 끝날 때 Stop hook(`.claude/hooks/check-after-work.sh`)이 `src/`·설정 파일에 커밋 안 된 변경이 있으면 이 두 명령을 자동으로 돌린다. 실패하면 턴이 끝나지 않고 오류가 전달되므로 이어서 고친다 (자동 재시도 1회, 그 뒤에는 사용자에게만 알린다)
- 통과한 변경은 지문을 `node_modules/.cache/living-wishlist-check/`에 저장해 다시 검사하지 않는다
- Edit/Write로 `src/`의 `.ts`·`.tsx`를 고치면 PostToolUse hook(`lint-changed-file.sh`)이 그 파일만 바로 eslint로 검사한다

## Git

- `main`에 바로 커밋하지 않는다. hook(`.claude/hooks/block-main-commit.sh`)이 막는다
- hook은 명령 글자만 보므로 브랜치 만들기와 `git commit`·`git push`를 `&&`로 묶지 말고 따로 실행한다
- 올릴 때는 `.claude/skills/ship/SKILL.md`의 순서(브랜치 → PR → 병합)를 따른다. 사용자는 `/ship`으로 부른다
- `/ship` 실행이 최종 승인이므로 커밋·푸시 전에 다시 묻지 않는다
- 커밋 메시지와 PR은 영어로 쓴다

## 구조

- 계층: `lib`·`hooks` → `components/ui` → `common`(여러 화면 공용) → `layout`(화면 틀 조각) → `features/<기능>`(한 기능 전용) → `app`. 아래층은 위층을 import하지 않는다
- `components/ui/`는 직접 쓰지 말고 `npx shadcn@latest add <이름>`으로 추가하고, `README.md`의 컴포넌트 목록에도 적는다
- 화면 틀은 `app/(marketing)/`(머리글 + 바닥글) 하나다. 새 페이지는 그 폴더 안에 만들고, `<main>`은 틀이 이미 그리므로 넣지 않는다 (틀 밖에서 그려지는 `app/not-found.tsx`·`app/error.tsx`만 `<main>`을 직접 넣는다)
- 사이트 이름과 메뉴는 `lib/site.ts`에서만 고친다
- error 컴포넌트의 "다시 시도"는 `retry` prop을 쓴다 (`reset`은 다시 불러오지 않고 다시 그리기만 한다)

## 코드 규칙

- 파일 이름은 kebab-case, 컴포넌트는 named export
- `"use client"`는 상태나 이벤트 핸들러가 필요한 파일에만 붙인다
- 화면 문구는 한국어로만 쓴다 (정적 사이트의 `{ ko, en }` 쌍 규칙은 쓰지 않는다)
- 색은 직접 적지 말고 토큰 클래스(`bg-background`, `text-muted-foreground` 등)를 쓴다. 토큰은 `src/app/globals.css`에 있다 (Tailwind 4라서 `tailwind.config` 파일이 없다)
- Prettier는 없다. 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)로 쓰고, 기존 파일을 고칠 때는 그 파일의 방식을 따른다
```

### 무엇이 바뀌는가 (내용은 유지, 자리만 이동)

| 현재 | 새 자리 |
|---|---|
| `# CLAUDE.md` + 영어 안내 문장 | 삭제 (H1을 `# project-notion-cms` 하나로). `@AGENTS.md`는 맨 위에 유지 |
| 제목 없는 글머리 1 (Git 규칙 한 줄) | 새 절 **## Git**, 글머리 5개로 분리 |
| 제목 없는 글머리 2 (규칙 파일 직접 읽기) | **## 프로젝트 문서** 안으로. `theme.md` 한 줄 추가 (현재 빠져 있음) |
| "프로젝트 문서"의 "PRD에서 정한 구현 방식" 한 줄 | 같은 절에서 글머리 3개로 분리 |
| "명령"의 "테스트 도구는 없다…" 한 줄 | 같은 절 안 "변경 확인" 소제목 아래 글머리 4개로 분리. `npm run check-all` 설명 한 줄 추가 (체크리스트에서 쓰는데 명령 절에 없었음) |
| "작업 완료 체크리스트" 아래 한 문단 | 글머리 3개로 분리 |
| "구조"·"코드 규칙" | 그대로. `"use client"` 조건만 파일 이름 규칙에서 분리 |
| (없음) | 맨 위 HTML 주석: 사람용 유지 안내 (Claude에게는 전달되지 않음) |

## 작업 순서

1. 위 전문으로 `CLAUDE.md`를 다시 쓴다 (Write)
2. 이 계획 파일을 홈 `CLAUDE.md` 규칙대로 `plans/2026-10-25-project-notion-cms-claude-md-organize-plan.md`로 옮기고(이름 변경), 아래 "상태"를 채운다
3. 사용자가 원하면 `/ship`으로 올린다 (`.md`만 바뀌므로 ship 스킬의 lint·build 단계는 건너뛴다)

## 검증

- `wc -l CLAUDE.md` 가 200줄 미만(약 70줄 예상), `grep -c '^# ' CLAUDE.md` 가 1 (H1 하나)
- `grep '^@' CLAUDE.md` 결과가 `@AGENTS.md` 한 줄
- 절 제목 보존 확인: `grep -n '^## ' CLAUDE.md` 에 "프로젝트 문서"·"명령"·"작업 완료 체크리스트"·"구조"·"코드 규칙"이 모두 있다
- 문장 누락 확인: 현재 파일의 글머리를 하나씩 새 파일에서 `grep`으로 찾는다 (예: `lsof -nP`, `retry`, `revalidate = 300`, `living-wishlist-check`, `{ ko, en }`)
- Stop hook은 `src/`·설정 파일이 안 바뀌어 검사를 건너뛴다 (정상)
- 사용자가 직접: 새 세션에서 `/context`로 Memory files에 `CLAUDE.md`가 있는지, `/doctor prompt-audit`로 낡은 문장이 없는지 확인

## 상태

- [x] 1단계 CLAUDE.md 다시 쓰기 (50줄·3,054자 → 77줄·3,496자. 늘어난 분량은 사람용 HTML 주석 4줄과 글머리 분리 때문이며, Claude에게 실리는 내용은 `theme.md` 안내·`check-all` 설명 두 줄만 추가)
- [x] 2단계 계획 파일 이름 변경·상태 기록
- [x] 3단계 `/ship` — `/doctor`가 제안한 `development-planner` 에이전트 모델 변경(`claude-fable-5-1` → `claude-sonnet-5-5`)과 같은 PR로 올림. Task 007 관련 파일(README.md, tasks/007, task-007 계획)은 다른 작업이라 제외
- 검증 결과: H1 1개, `^@` import는 `@AGENTS.md` 한 줄, 절 제목 5개 모두 보존, 기존 핵심 문구 16개 모두 새 파일에 있음. Stop hook은 `.md`만 바뀌어 검사를 건너뜀
- 남은 일 (사용자 직접): 새 세션에서 `/context`로 CLAUDE.md 로드 확인, `/doctor prompt-audit`로 낡은 문장 점검
