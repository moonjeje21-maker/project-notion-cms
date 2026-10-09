# 별도 저장소 만들기 · 이름 바꾸기 · plans 정리 · CLAUDE.md 효율화 계획

- 날짜: 2026-10-09
- 프로젝트: project-notion-cms
- 상태: 계획 (승인 전)

## Context (왜 하는가)

이 폴더는 스타터 킷 `claude-nextjs`를 복사한 것이라 ① 자체 저장소가 없고 ② 이름이 스타터 킷 것이며 ③ `plans/`에 원본 프로젝트의 계획 파일 15개가 따라와 있다. 앞서 `/init` 점검(`2026-10-05-project-notion-cms-claude-md-init-plan.md`)의 "남은 작업" 네 가지를 한 번에 처리한다.

사용자 결정: GitHub 저장소 `moonjeje21-maker/project-notion-cms`, **공개(public)**. 사이트 이름은 **Notion CMS**.

> 용어: 저장소(repository) = 파일과 변경 기록을 함께 보관하는 곳. `git init` = 폴더를 새 저장소로 만드는 명령. PR(Pull Request) = "이 변경을 main에 합쳐 달라"는 요청. hook = 특정 명령 직전에 자동으로 실행되는 검사 스크립트.

## 핵심 설계: 첫 커밋도 PR로 올린다

이 프로젝트에는 "`main`에 바로 커밋하지 않는다" 규칙과, Claude가 `main`에서 `git commit`/`git push`를 실행하면 막는 hook(`.claude/hooks/block-main-commit.sh`)이 있다. 새 저장소의 첫 커밋은 보통 `main`에 직접 하지만, 그러면 규칙과 hook에 걸린다. 그래서:

1. GitHub가 저장소를 만들면서 README 하나짜리 첫 커밋을 `main`에 넣게 한다 (`gh repo create --add-readme`)
2. 내 컴퓨터의 폴더를 그 저장소에 연결한 뒤, 프로젝트 파일 전체를 **작업 브랜치 → PR → 병합**으로 올린다 (`/ship`과 같은 순서)

결과적으로 `main`에 직접 커밋하는 일이 한 번도 없다. 원본 `claude-nextjs`는 hook이 생기기 전이라 `main`에 바로 첫 커밋을 했다.

## 단계

### 1단계. 파일 고치기 (git 작업 전, 한 번에)

**이름 바꾸기**

| 파일 | 바꾸는 것 |
|---|---|
| `package.json` 2행 | `"name": "claude-nextjs"` → `"project-notion-cms"` |
| `package-lock.json` 2행·8행 | 같은 값 2곳 |
| `src/lib/site.ts` 36~39행 | `name: "Notion CMS"`, `title: "Notion CMS"`, `description: "Notion을 콘텐츠 관리 도구(CMS)로 쓰는 Next.js 사이트"` |
| `README.md` 1~3행 | 제목 `# project-notion-cms`, 소개 문장을 "스타터 킷 `claude-nextjs`에서 시작한 프로젝트입니다. Notion 연동은 아직 없습니다."로. 나머지(버전 표, 화면 목록, 폴더 그림)는 아직 맞으므로 그대로 둔다 |

시작 화면(`app/(marketing)/page.tsx`)의 본문 문구와 기술 스택 카드는 스타터 킷 안내 그대로 둔다. 실제 화면을 만들 때 통째로 바뀔 내용이다.

**plans 정리**

- `plans/*claude-nextjs*` 15개를 지운다. 지우기 전에 `diff`로 `claude-nextjs/plans/`의 원본과 같은지 다시 확인한다 (앞서 폴더 전체 비교에서 차이 없음을 확인했다)
- 남기는 것: `2026-10-05-project-notion-cms-claude-md-init-plan.md`(남은 작업을 "이 계획에서 진행"으로 갱신), 이 계획 파일

**CLAUDE.md 효율화** — 전체를 아래로 바꾼다 (4,717바이트 → 약 3,800바이트 예상, 고친 뒤 직접 잰다)

이 파일은 10-05에 이미 한 번 크게 줄였으므로(6,360 → 3,461) 이번 여지는 크지 않다. 바꾸는 이유별로:

| 처리 | 내용 |
|---|---|
| 지운다 | "스타터 킷을 복사해 시작했다…" 문단, "아직 자체 저장소가 없다…" 줄 — 이 계획이 끝나면 사실이 아니다 |
| 합친다 | 규칙 파일 안내 2줄 → 1줄 (둘 다 "명령만 칠 때는 자동으로 안 읽히니 직접 읽어라"가 요지) |
| 합친다 | `build` 줄의 "확인할 때는 lint와 build 둘 다"와 "변경 확인은 lint + build + 브라우저" 중복 → 뒤쪽에만 남긴다 |
| 줄인다 | Git 줄: 브랜치 접두사·`gh pr merge --merge`는 `ship/SKILL.md`와 hook 안내문에 있으므로 뺀다. 대신 "hook이 막는다"를 적는다 |
| 지운다 | "컴포넌트는 PascalCase" — `~/CLAUDE.md`의 "새 React 프로젝트" 규칙과 중복. "서버 컴포넌트가 기본" — Next.js 일반 상식이라 `"use client"` 조건만 남긴다 |
| 합친다 | "스타일" 절(2줄)과 파일 이름·문구 규칙 2줄 → "코드 규칙" 절 하나. "구조" 절에는 폴더·계층·화면 틀만 남는다 |

````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# project-notion-cms

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (radix-nova) · npm. 코드는 `src/` 아래, import 별칭은 `@/*`. 정확한 버전, 화면 목록, 폴더 그림, 설치된 shadcn 컴포넌트는 `README.md`에 있다.

- `main`에 바로 커밋하지 않는다 (hook이 막는다). 올릴 때는 `.claude/skills/ship/SKILL.md`의 순서(브랜치 → PR → 병합)를 따르고, 커밋 메시지와 PR은 영어로 쓴다. 사용자는 `/ship`으로 부른다
- 명령만 실행할 때는 경로 규칙이 자동으로 읽히지 않으므로 직접 읽는다: 라이브러리 설치·버전 올리기·`npm audit`·설정 파일 수정 전과 build 캐시 오류에는 `.claude/rules/dependencies.md`, 처음 쓰는 API나 라이브러리 설치·업그레이드에는 `.claude/rules/library-docs.md`

## 명령

- `npm run dev` — 개발 서버 (http://localhost:3000). 이미 켜져 있을 수 있으니 먼저 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 확인한다
- `npm run lint` — 전체 lint. 파일 하나만: `npx eslint src/app/layout.tsx`
- `npm run build` — 배포용 빌드 + 타입 검사 (lint는 돌리지 않는다). dev 서버를 켠 채로 돌려도 된다
- 타입 검사만: `npx next typegen && npx tsc --noEmit` (typegen이 `LayoutProps` 같은 전역 타입을 만든다)
- 테스트 도구는 없다. 변경 확인은 lint + build + 브라우저(Playwright MCP)로 한다. 스크린샷은 `.playwright-mcp/이름.png`로 저장한다 (git이 무시하는 폴더). 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다

## 구조

- 계층: `lib`·`hooks` → `components/ui` → `common`(여러 화면 공용) → `layout`(화면 틀 조각) → `features/<기능>`(한 기능 전용) → `app`. 아래층은 위층을 import하지 않는다
- `components/ui/`는 직접 쓰지 말고 `npx shadcn@latest add <이름>`으로 추가하고, `README.md`의 컴포넌트 목록에도 적는다. 단 `hooks/use-mobile.ts`는 lint 규칙 때문에 고쳐 둔 파일이므로 `--overwrite`로 덮어쓰지 않는다
- 화면 틀은 둘이다: `app/(marketing)/`(머리글 + 바닥글)과 `app/(dashboard)/`(사이드바 + 상단 바). 새 페이지는 쓸 틀의 폴더 안에 만들고, `<main>`은 틀이 이미 그리므로 넣지 않는다 (두 틀 밖에서 그려지는 `app/not-found.tsx`·`app/error.tsx`만 `<main>`을 직접 넣는다)
- 사이트 이름과 메뉴는 `lib/site.ts`에서만 고친다. 대시보드 페이지를 추가하면 `sidebarNav`에도 넣는다 (상단 바 제목과 사이드바 메뉴 강조는 `sidebarNav`의 최상위 항목만 본다. 하위 `items`의 주소에는 붙지 않는다)
- error 컴포넌트의 "다시 시도"는 `retry` prop을 쓴다 (`reset`은 다시 불러오지 않고 다시 그리기만 한다)

## 코드 규칙

- 파일 이름은 kebab-case, 컴포넌트는 named export. `"use client"`는 상태나 이벤트 핸들러가 필요한 파일에만 붙인다
- 화면 문구는 한국어로만 쓴다 (정적 사이트의 `{ ko, en }` 쌍 규칙은 쓰지 않는다)
- 색은 직접 적지 말고 토큰 클래스(`bg-background`, `text-muted-foreground` 등)를 쓴다. 토큰은 `src/app/globals.css`에 있다 (Tailwind 4라서 `tailwind.config` 파일이 없다)
- Prettier는 없다. 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)로 쓰고, 기존 파일을 고칠 때는 그 파일의 방식을 따른다
````

### 2단계. 검사

- `npm run lint`, `npm run build` (이름만 바뀌었지만 `src/lib/site.ts`가 바뀌었으므로 둘 다)
- `src/`가 바뀌었으므로 `ship/SKILL.md` 규칙대로 `code-reviewer` 에이전트에 `src/lib/site.ts`·`package.json`의 변경(원본 `claude-nextjs`와의 diff)과 lint·build 결과를 넘겨 검토받는다

### 3단계. GitHub 저장소 만들기

```
gh repo create moonjeje21-maker/project-notion-cms --public --add-readme --description "Notion을 콘텐츠 관리 도구(CMS)로 쓰는 Next.js 사이트"
```

`--add-readme`가 README 하나짜리 첫 커밋을 `main`에 만든다 (3단계에서 유일하게 바깥에 보이는 작업. 사용자가 공개로 결정했다).

### 4단계. 폴더를 저장소에 연결 (`/Users/ky.moon/workspace1/project-notion-cms`에서)

```
git init -b main
git remote add origin https://github.com/moonjeje21-maker/project-notion-cms.git
git fetch origin
git reset origin/main          # main을 GitHub의 첫 커밋에 맞춘다. 작업 파일은 건드리지 않는다
git branch -u origin/main main # 나중에 git pull이 되게 연결
git switch -c chore/initial-import
```

- `git reset origin/main`이 아직 커밋이 없는 브랜치에서 안 되면 `git update-ref refs/heads/main origin/main` 뒤 `git reset`으로 같은 효과를 낸다
- 이 시점의 `git status`: GitHub가 만든 `README.md`는 "수정됨", 나머지 프로젝트 파일은 전부 "추적 안 됨"이어야 한다. `node_modules`, `.next`, `next-env.d.ts`, `tsconfig.tsbuildinfo`는 `.gitignore`가 빼 준다

### 5단계. 확인 (한 번) → 커밋 → PR → 병합

사용자 규칙("커밋·푸시 전에 보여 주고 확인")에 따라 **여기서 한 번 멈춘다.** 보여 줄 것: 올릴 파일 목록(`git add --dry-run .`), 변경 요약, 커밋 메시지, PR 제목. 승인 후:

```
git add .                      # 첫 올리기라 전체. 목록은 위에서 확인받는다
git commit -m "Initial import: project-notion-cms from claude-nextjs starter kit" (+ Co-Authored-By 줄)
git push -u origin chore/initial-import
gh pr create --base main --title "Initial import from claude-nextjs starter kit" (본문: ## Summary, ## Testing, 영어)
gh pr merge --merge --delete-branch
git switch main && git pull --ff-only
```

### 6단계. 상위 저장소 2곳의 안내 고치기 (파일만)

| 파일 | 바꾸는 것 |
|---|---|
| `/Users/ky.moon/workspace1/.gitignore` | `claude-nextjs/` 아래에 `project-notion-cms/` 추가 → workspace1이 이 폴더를 더 이상 "추적 안 된 폴더"로 보여 주지 않는다 |
| `/Users/ky.moon/CLAUDE.md` | Git 주의의 별도 저장소 목록에 `workspace1/project-notion-cms/` 추가 |

이 두 파일은 각각 `workspace1`·`home-config` 저장소의 것이고, 두 저장소는 `main`에 바로 커밋하는 방식이다. 그런데 이 프로젝트의 hook은 이 세션에서 실행하는 모든 `git commit`/`git push`를 "현재 브랜치가 main이면" 막기 때문에, 여기서는 그 커밋을 할 수 없다. 우회하지 않고 **파일만 고친 뒤, 마지막 보고에서 직접 실행할 명령 2줄(`! git …`)을 드린다.** 원본 분리 때도 `~/CLAUDE.md`는 파일만 고치고 커밋은 따로 했다.

### 7단계. 마무리

- 이 계획 파일 이름을 `2026-10-09-project-notion-cms-repo-setup-plan.md`로 바꾸고 완료 기록을 적는다 (5단계 PR에 포함되도록 **1단계에서 미리** 이름을 바꾼다)
- 보고: PR 주소, 저장소 주소, `CLAUDE.md` 크기 변화, 사용자가 직접 실행할 명령 2줄

## 하지 않는 것

- 시작 화면 본문·기술 스택 카드 문구 바꾸기, Notion 연동 코드, `README.md` 본문 재작성 (실제 기능을 만들 때)
- `workspace1`·`home-config` 저장소의 커밋·푸시 (위 6단계 이유)
- `.claude/` 아래 규칙·스킬·hook 수정 (프로젝트 이름이 들어 있지 않아 그대로 쓸 수 있다)

## 확인 방법

1. `git -C project-notion-cms log --oneline` → GitHub 첫 커밋 + 병합 커밋, `git remote -v` → 새 주소, `git status --short` → 비어 있음
2. `gh repo view moonjeje21-maker/project-notion-cms --json visibility,defaultBranchRef` → PUBLIC, main. `gh pr view 1 --json state` → MERGED
3. `git -C /Users/ky.moon/workspace1 status --short`에 `project-notion-cms/`가 안 나옴 (`.gitignore`만 수정됨으로 나옴)
4. `grep -rn "claude-nextjs\|Starter Kit\|스타터 킷" --exclude-dir=node_modules --exclude-dir=plans .` → README 소개 문장 1곳만 남음
5. `ls plans` → 파일 2개
6. `wc -c CLAUDE.md`로 크기를 재고, 예전 내용의 각 줄이 새 파일이나 위 "처리" 표 중 한 곳에 있는지 대조
7. lint·build 통과 (2단계), 개발 서버가 떠 있으면 http://localhost:3000 제목이 "Notion CMS"로 보이는지 Playwright로 확인
