# CLAUDE.md 점검 계획 (/init) — project-notion-cms

- 날짜: 2026-10-05
- 프로젝트: project-notion-cms
- 상태: 완료 (2026-10-05, 커밋하지 않음) — 결과는 맨 아래 "완료 기록" 참고

## Context (왜 하는가)

`/init`은 폴더를 읽고 `CLAUDE.md`(Claude Code가 대화를 시작할 때마다 읽는 안내 파일)를 만들거나, 이미 있으면 고칠 점을 제안하는 명령이다.

이 폴더는 스타터 킷 `claude-nextjs`를 그대로 복사한 것이다. 두 폴더를 비교한 결과 코드 차이가 없고, Notion 관련 코드는 아직 없다. 그래서 `CLAUDE.md`의 내용 대부분은 그대로 맞다. 맞지 않는 곳은 **복사하면서 달라진 사정** 두 가지뿐이다.

## 점검 결과

### 맞는 것으로 확인한 내용 (고치지 않는다)

| 확인한 것 | 방법 | 결과 |
|---|---|---|
| `npm run lint` | 직접 실행 | 오류 없음 |
| `npx next typegen && npx tsc --noEmit` (타입 검사) | 직접 실행 | 오류 없음 |
| `npm run build` | 직접 실행 | 통과 (`/`, `/_not-found`, `/dashboard`) |
| 구조·스타일 설명 (화면 틀 2개, `lib/site.ts`, `retry`, `<main>` 예외, `use-mobile.ts`) | 해당 파일을 읽어 대조 | 모두 일치 |
| `.claude/` 아래 규칙·스킬·에이전트·hook | `claude-nextjs`와 비교 | 빠진 파일 없음 |
| Cursor · Copilot · Codex · Gemini 설정 | 파일이 있는지 확인 | 없음. 가져올 것이 없다 |

### 고칠 곳 2곳

**1. 제목이 원본 프로젝트 이름이다**

- 지금: `# claude-nextjs (웹개발 스타터 킷)`
- 문제: 이 폴더는 `project-notion-cms`다. 또 `package.json`의 `name`, `src/lib/site.ts`의 사이트 이름, `README.md`, `plans/`의 파일 15개가 모두 `claude-nextjs` 것이어서, 설명이 없으면 Claude가 어느 프로젝트인지 헷갈리거나 새 계획 파일에 원본 이름을 붙일 수 있다

**2. Git 규칙이 "자체 저장소가 있다"는 전제로 쓰여 있다**

- 지금: "`main`에 바로 커밋하지 않는다. 브랜치 → PR → 병합 … `/ship`"
- 실제: 이 폴더에는 `.git`(저장소 정보가 담긴 폴더)이 없다. 그래서 여기서 실행한 git 명령은 상위 `workspace1` 저장소에 적용된다. 지금 `/ship`을 부르면 브랜치와 PR이 `workspace1` 저장소에 만들어지고, 이 프로젝트 파일 전체가 거기에 기록된다
- 결정(사용자 확인): **별도 저장소로 만든다.** 규칙 자체는 그대로 두고, 저장소가 생기기 전까지의 주의 한 줄만 붙인다

## 바꿀 내용

파일은 `CLAUDE.md` 하나만 고친다.

### 수정 1 — 제목과 소개 (7~9행)

제목을 바꾸고, 소개 문단 뒤에 한 문단을 덧붙인다.

```markdown
# project-notion-cms

Next.js 16 (App Router) · … `README.md`에 있다.   ← 이 문단은 그대로

스타터 킷 `claude-nextjs`를 복사해 시작했다. `package.json`의 `name`, `lib/site.ts`의 사이트 이름·메뉴, `README.md`는 아직 스타터 킷 값이고, `plans/`의 `claude-nextjs-*` 파일은 원본 프로젝트의 기록이다 (새 계획 파일 이름에는 `project-notion-cms`를 쓴다).
```

### 수정 2 — Git 규칙 앞에 한 줄 추가

"`main`에 바로 커밋하지 않는다…" 줄 **위에** 아래 줄을 넣는다. 기존 줄은 고치지 않는다.

```markdown
- 아직 자체 저장소가 없다 (별도 저장소로 만들 예정). 지금 이 폴더의 git 명령은 상위 `workspace1` 저장소에 적용되므로, 이 폴더에 `.git`이 생기기 전에는 커밋·푸시·`/ship`을 하지 않는다. 저장소를 만들 때 `workspace1/.gitignore`와 `~/CLAUDE.md`의 별도 저장소 목록에 `project-notion-cms/`를 추가하고 이 줄을 지운다
```

## 이번에 하지 않는 것

- **저장소 만들기** (`git init`, GitHub에 새 저장소 생성, `workspace1/.gitignore`·`~/CLAUDE.md` 수정): 바깥에 공개되는 작업이라 따로 요청받으면 진행한다
- **이름 바꾸기** (`package.json`의 `name`, `site.ts`의 사이트 이름, `README.md` 제목): 사이트 이름을 무엇으로 할지는 사용자가 정할 일이다
- **`plans/`의 `claude-nextjs-*` 파일 15개 정리**: 원본이 `claude-nextjs/plans/`에 있어 지워도 되지만, 지우는 것은 사용자가 정한다
- **Notion 관련 안내**: 코드가 아직 없으므로 지어내서 적지 않는다. 연동 코드를 넣을 때 함께 적는다

## 확인 방법

1. 고친 `CLAUDE.md`를 다시 읽어 두 곳만 바뀌었는지 본다
2. `.md` 파일만 바뀌므로 lint·build는 다시 돌리지 않는다 (위 표에서 이미 통과)
3. 커밋하지 않는다 (자체 저장소가 아직 없다)

## 끝난 뒤

- 이 계획 파일의 이름을 `2026-10-05-project-notion-cms-claude-md-init-plan.md`로 바꾸고, 맨 아래에 완료 기록을 적는다

## 완료 기록 (2026-10-05)

- `CLAUDE.md` 두 곳을 계획대로 고쳤다 (4,022 → 4,717바이트). 원본 `claude-nextjs/CLAUDE.md`와 비교해 바뀐 곳이 제목 1줄, 추가한 문단 1개, 추가한 Git 주의 1줄뿐임을 확인했다
- 이 계획 파일의 이름을 규칙에 맞게 바꿨다
- 커밋하지 않았다 (자체 저장소가 아직 없다)

### 남은 작업

- 별도 저장소 만들기, 이름 바꾸기, `plans/` 정리, `CLAUDE.md` 효율화 → `2026-10-09-project-notion-cms-repo-setup-plan.md`에서 진행
- Notion 연동 코드를 넣을 때 `CLAUDE.md`에 관련 안내 추가
