# CLAUDE.md 점검·보강 계획 (/init) — project-notion-cms

- 날짜: 2026-10-09
- 프로젝트: project-notion-cms
- 상태: 완료 (2026-10-09, 커밋하지 않음) — 결과는 맨 아래 "완료 기록" 참고

## Context (왜 하는가)

`/init`은 폴더를 읽고 `CLAUDE.md`(Claude Code가 대화를 시작할 때마다 읽는 안내 파일)를 만들거나, 이미 있으면 고칠 점을 제안하는 명령이다.

이 저장소의 `CLAUDE.md`는 10-09 저장소 설정 작업(`plans/2026-10-09-project-notion-cms-repo-setup-plan.md`)에서 새로 쓴 것이라 **코드 설명은 전부 정확하다**. 소스·설정·규칙·스킬·hook을 다시 읽어 대조했고, `npm run lint`와 `npx next typegen && npx tsc --noEmit`도 통과했다.

다만 그 뒤에 들어온 일 두 가지가 `CLAUDE.md`에 없다.

1. **프로젝트가 무엇을 만드는지**: PR #4로 올라온 `docs/prd/2026-10-09-project-notion-cms-prd.md`(Living Wishlist MVP PRD)가 정식 설계도가 됐다. 코드에는 아직 Notion 관련 내용이 전혀 없어서(`@notionhq/client` 미설치, `.env` 없음), 코드만 읽어서는 Claude가 이 결정들을 알 수 없다.
2. **PRD 에이전트 작업 흐름**: `.claude/agents/`에 `prd-generator` → `prd-validator` 순서로 쓰는 에이전트 2개가 생겼고, 결과는 `docs/prd/`에 저장된다.

그리고 사실과 어긋나기 시작한 문구 하나:

3. **브라우저 확인 도구**: "Playwright MCP로 한다"고 적혀 있지만 `.claude/settings.local.json`(git에 안 올라가는 내 컴퓨터 전용 설정)에서 Playwright MCP가 꺼져 있고, 지금은 Claude in Chrome(크롬 확장) 도구를 쓴다. 사용자 결정: **둘 다 적는다**.

Cursor · Copilot · Codex · Gemini 설정 파일은 없어서 가져올 것이 없다 (10-05 점검과 같음).

## 바꾸는 파일

`CLAUDE.md` 하나만 고친다. 세 군데를 바꾸고 나머지는 그대로 둔다.

### 수정 1 — 브라우저 확인 줄 (## 명령 절 마지막 줄)

지금:

```markdown
- 테스트 도구는 없다. 변경 확인은 lint + build + 브라우저(Playwright MCP)로 한다. 스크린샷은 `.playwright-mcp/이름.png`로 저장한다 (git이 무시하는 폴더). 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다
```

바꿀 내용:

```markdown
- 테스트 도구는 없다. 변경 확인은 lint + build + 브라우저(Claude in Chrome 또는 Playwright MCP)로 한다. Playwright MCP는 `.mcp.json`에 있지만 `settings.local.json`에서 꺼 둘 수 있으니 안 보이면 그 때문이다. 스크린샷은 `.playwright-mcp/이름.png`로 저장한다 (git이 무시하는 폴더). 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다
```

### 수정 2 — Git 줄에 hook 주의 한 구절 추가 (맨 위 목록 첫 줄)

`/ship` 밖에서 사용자가 직접 커밋을 부탁할 때도 걸리는 함정이라 한 구절만 덧붙인다. hook(`.claude/hooks/block-main-commit.sh`)은 명령 글자에 `git commit`·`git push`가 있으면 `main`에서 막으므로, `git switch -c … && git commit …`처럼 한 줄로 묶으면 브랜치를 만들기도 전에 막힌다.

지금:

```markdown
- `main`에 바로 커밋하지 않는다 (hook이 막는다). 올릴 때는 `.claude/skills/ship/SKILL.md`의 순서(브랜치 → PR → 병합)를 따르고, 커밋 메시지와 PR은 영어로 쓴다. 사용자는 `/ship`으로 부른다
```

바꿀 내용:

```markdown
- `main`에 바로 커밋하지 않는다 (hook이 막는다. 명령 글자만 보므로 브랜치 만들기와 `git commit`·`git push`를 `&&`로 묶지 말고 따로 실행한다). 올릴 때는 `.claude/skills/ship/SKILL.md`의 순서(브랜치 → PR → 병합)를 따르고, 커밋 메시지와 PR은 영어로 쓴다. 사용자는 `/ship`으로 부른다
```

### 수정 3 — 새 절 "## 진행 중인 작업" 추가 (## 명령 절 앞)

PRD 내용을 베끼지 않고, 코드만 봐서는 알 수 없는 결정과 문서 위치만 적는다.

```markdown
## 진행 중인 작업

- 만드는 것: **Living Wishlist** — Notion 표에 적은 인테리어 소품을 카드 한 화면으로 보여 주는 읽기 전용 사이트. 설계도는 `docs/prd/2026-10-09-project-notion-cms-prd.md`(기준 기획: `plans/2026-10-09-project-notion-cms-interior-service-plan.md`). 기능을 만들 때는 PRD의 기능 ID(F001~)를 따른다
- 코드에는 아직 Notion 연동이 없다 (`@notionhq/client` 미설치, `.env` 없음). 시작 화면·대시보드·`lib/site.ts`의 이름과 메뉴는 아직 스타터 킷 값이다
- PRD에서 이미 정한 구현 방식 (코드에 없으니 여기서 확인한다): Notion SDK 5.x는 데이터베이스 ID가 아닌 **데이터 소스 ID**로 조회한다 (환경변수 `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`) · 자동 갱신은 `cacheComponents`를 켜지 않고 페이지 파일의 `export const revalidate = 300`으로 한다 (개발 서버에서는 캐시가 안 돌아 `npm run build && npm run start`로 확인) · 검색 엔진 색인 거부는 루트 `app/layout.tsx`의 `metadata.robots`로 모든 경로에 건다 · 외부 이미지는 `next/image` 대신 일반 `<img>`를 쓴다
- PRD 작성은 `prd-generator` 에이전트, 검증은 `prd-validator` 에이전트 순서로 한다. 둘 다 `docs/prd/`에 저장한다 (검증 결과는 `<이름>-validation.md`)
```

## 이번에 하지 않는 것

- `README.md`, `lib/site.ts`, `plans/` 정리: 코드와 아직 맞고, 이름·메뉴 교체는 PRD 구현 단계의 일이다
- Notion 연동 코드 작성: `/init`의 범위가 아니다
- `.claude/settings.local.json` 수정: 내 컴퓨터 전용 설정이고 사용자가 정한 상태다

## 확인 방법

1. 고친 `CLAUDE.md`를 다시 읽어 세 곳만 바뀌었는지 `git diff CLAUDE.md`로 본다
2. `.md` 파일만 바뀌므로 lint·build는 다시 돌리지 않는다 (점검 중 이미 통과)
3. 커밋은 하지 않는다. 올리려면 사용자가 `/ship`을 부른다

## 끝난 뒤

- 이 계획 파일을 `plans/2026-10-09-project-notion-cms-claude-md-update-plan.md`로 이름 바꾸고, 맨 아래에 완료 기록을 적는다 (10-05 점검 파일과 이름이 겹치지 않게 `update`를 쓴다)

## 완료 기록 (2026-10-09)

- `CLAUDE.md` 세 곳을 계획대로 고쳤다: Git 줄에 hook 주의 구절 추가, "## 진행 중인 작업" 절 신설(4줄), 브라우저 확인 줄을 "Claude in Chrome 또는 Playwright MCP"로 변경
- `git diff --stat CLAUDE.md`로 바뀐 범위를 확인했다
- 이 계획 파일의 이름을 규칙에 맞게 바꿨다
- 커밋하지 않았다. 올리려면 `/ship`을 부른다

### 남은 작업

- 없음 (Notion 연동 코드를 넣을 때 "진행 중인 작업" 절을 실제 코드 기준으로 갱신한다)
