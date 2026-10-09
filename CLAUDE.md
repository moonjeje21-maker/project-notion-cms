# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# project-notion-cms

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (radix-nova) · npm. 코드는 `src/` 아래, import 별칭은 `@/*`. 정확한 버전, 화면 목록, 폴더 그림, 설치된 shadcn 컴포넌트는 `README.md`에 있다.

- `main`에 바로 커밋하지 않는다 (hook이 막는다. 명령 글자만 보므로 브랜치 만들기와 `git commit`·`git push`를 `&&`로 묶지 말고 따로 실행한다). 올릴 때는 `.claude/skills/ship/SKILL.md`의 순서(브랜치 → PR → 병합)를 따르고, 커밋 메시지와 PR은 영어로 쓴다. 사용자는 `/ship`으로 부른다
- 명령만 실행할 때는 경로 규칙이 자동으로 읽히지 않으므로 직접 읽는다: 라이브러리 설치·버전 올리기·`npm audit`·설정 파일 수정 전과 build 캐시 오류에는 `.claude/rules/dependencies.md`, 처음 쓰는 API나 라이브러리 설치·업그레이드에는 `.claude/rules/library-docs.md`

## 진행 중인 작업

- 만드는 것: **Living Wishlist** — Notion 표에 적은 인테리어 소품을 카드 한 화면으로 보여 주는 읽기 전용 사이트. 설계도는 `docs/prd/2026-10-09-project-notion-cms-prd.md`(기준 기획: `plans/2026-10-09-project-notion-cms-interior-service-plan.md`). 기능을 만들 때는 PRD의 기능 ID(F001~)를 따른다
- 코드에는 아직 Notion 연동이 없다 (`@notionhq/client` 미설치, `.env` 없음). 시작 화면·대시보드·`lib/site.ts`의 이름과 메뉴는 아직 스타터 킷 값이다
- PRD에서 이미 정한 구현 방식 (코드에 없으니 여기서 확인한다): Notion SDK 5.x는 데이터베이스 ID가 아닌 **데이터 소스 ID**로 조회한다 (환경변수 `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`) · 자동 갱신은 `cacheComponents`를 켜지 않고 페이지 파일의 `export const revalidate = 300`으로 한다 (개발 서버에서는 캐시가 안 돌아 `npm run build && npm run start`로 확인) · 검색 엔진 색인 거부는 루트 `app/layout.tsx`의 `metadata.robots`로 모든 경로에 건다 · 외부 이미지는 `next/image` 대신 일반 `<img>`를 쓴다
- PRD 작성은 `prd-generator` 에이전트, 검증은 `prd-validator` 에이전트 순서로 한다. 둘 다 `docs/prd/`에 저장한다 (검증 결과는 `<이름>-validation.md`)

## 명령

- `npm run dev` — 개발 서버 (http://localhost:3000). 이미 켜져 있을 수 있으니 먼저 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 확인한다
- `npm run lint` — 전체 lint. 파일 하나만: `npx eslint src/app/layout.tsx`
- `npm run build` — 배포용 빌드 + 타입 검사 (lint는 돌리지 않는다). dev 서버를 켠 채로 돌려도 된다
- 타입 검사만: `npx next typegen && npx tsc --noEmit` (typegen이 `LayoutProps` 같은 전역 타입을 만든다)
- 테스트 도구는 없다. 변경 확인은 lint + build + 브라우저(Claude in Chrome 또는 Playwright MCP)로 한다. Playwright MCP는 `.mcp.json`에 있지만 `settings.local.json`에서 꺼 둘 수 있으니 안 보이면 그 때문이다. 스크린샷은 `.playwright-mcp/이름.png`로 저장한다 (git이 무시하는 폴더). 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다

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
