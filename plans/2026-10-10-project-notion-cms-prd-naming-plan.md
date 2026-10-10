# PRD 저장 이름 규칙 통일 계획

작성일: 2026-10-10 · 대상: `.claude/agents/prd-generator.md`, `.claude/agents/prd-validator.md`, `.claude/agents/starter-cleaner.md`, `.claude/agents/development-planner.md`, `CLAUDE.md`

## 배경 (Context)

2026-10-10에 PRD 파일이 `docs/prd/2026-10-09-project-notion-cms-prd.md`에서 `docs/prd/prd.md`로 바뀌었고(PR #11), 옛 검증 보고서는 삭제됐다. 그런데 PRD를 만들고 검증하는 두 에이전트는 아직 옛 규칙(날짜·프로젝트명이 든 파일 이름, `*-prd.md` 검색)을 따른다. 다음에 `prd-generator`를 돌리면 `docs/prd/2026-10-10-project-notion-cms-prd.md`가 또 생기고, `prd-validator`는 경로 없이 부르면 `*-prd.md`를 찾아 `prd.md`를 못 본다. 사용자가 "이해하기 쉬운 저장 이름 규칙"을 정해 달라고 했다.

## 정한 규칙: "PRD는 하나, 날짜는 파일 안에, 과거는 git에"

```
docs/prd/
├─ prd.md                    지금 유효한 PRD. 항상 이 이름 하나
├─ prd-validation.md         prd.md의 검증 결과. 다시 검증하면 덮어씀
├─ prd-draft.md              prd.md가 이미 있을 때 새로 만든 초안. 비교·반영 뒤 삭제
└─ prd-draft-validation.md   초안의 검증 결과
```

- 파일 이름에 날짜·프로젝트명을 넣지 않는다. 작성일은 문서 첫머리 "작성일" 줄에, 과거 버전은 git 기록으로 본다 (저장소 폴더 이름이 이미 프로젝트명이라 중복이다)
- 검증 결과는 항상 "검증한 파일 이름 + `-validation`" → 이름만 봐도 짝이 보인다
- `prd-generator`: `prd.md`가 없으면 거기에 쓴다. 있으면 **덮어쓰지 않고** `prd-draft.md`에 쓴다. `prd-draft.md`까지 있으면 쓰지 않고 "먼저 초안을 정리해 주세요"라고 보고하고 끝낸다 (에이전트는 Read·Write만 있어 파일을 옮기지 못하므로, 지우는 일은 사용자가 한다)
- `prd-validator`: 경로를 안 주면 `docs/prd/prd.md`를 검증한다

## 수정 내용

### 1. `.claude/agents/prd-generator.md`

| 위치 | 지금 | 바꾼 뒤 |
|---|---|---|
| 3행 description | `saves the PRD under docs/prd/, returns the saved file path` | `saves it as docs/prd/prd.md (or docs/prd/prd-draft.md when prd.md already exists), returns the saved file path` |
| 24~26행 출력 | `docs/prd/<날짜>-<프로젝트>-prd.md`로 저장 + 날짜·프로젝트명 하위 항목 2개 | `docs/prd/prd.md`로 저장합니다. 폴더가 없으면 Write가 함께 만듭니다.<br>  - `docs/prd/prd.md`가 이미 있으면 덮어쓰지 않고 `docs/prd/prd-draft.md`에 저장합니다. 사용자가 둘을 비교해 반영한 뒤 초안을 지웁니다.<br>  - `docs/prd/prd-draft.md`도 이미 있으면 파일을 쓰지 않고 "docs/prd/prd-draft.md를 먼저 정리해 주세요"라고 보고하고 끝냅니다.<br>  - 날짜는 파일 이름이 아니라 문서 첫머리 `작성일: YYYY-MM-DD` 줄에 씁니다. |
| 28행 | `` `prd-validator 에이전트로 docs/prd/<파일>을 검증하세요` `` | `` `prd-validator 에이전트로 docs/prd/prd.md를 검증하세요` `` (초안이면 `prd-draft.md`) |
| 302행 절차 10 | `docs/prd/<날짜>-<프로젝트>-prd.md`에 저장 | `docs/prd/prd.md`(이미 있으면 `prd-draft.md`)에 저장 |
| 339행 마무리 | `docs/prd/<파일>을 검증하세요` | `docs/prd/prd.md(초안이면 prd-draft.md)를 검증하세요` |

### 2. `.claude/agents/prd-validator.md`

| 위치 | 지금 | 바꾼 뒤 |
|---|---|---|
| 3행 description | 예시 `docs/prd/2026-10-09-project-prd.md를 검증해줘` · `docs/prd/2026-10-09-payment-prd.md 기술적으로 검증해주세요` · `경로가 없으면 에이전트가 docs/prd/에서 최근 PRD를 찾습니다` | `docs/prd/prd.md를 검증해줘` · `docs/prd/prd.md 기술적으로 검증해주세요` · `경로가 없으면 에이전트가 docs/prd/prd.md를 검증합니다` |
| 23행 입력 | `docs/prd/*-prd.md`를 Glob으로 찾아 가장 최근 파일을 씁니다 | `docs/prd/prd.md`를 씁니다 |
| 28행 출력 예 | `docs/prd/2026-10-09-foo-prd.md` → `docs/prd/2026-10-09-foo-prd-validation.md` | `docs/prd/prd.md` → `docs/prd/prd-validation.md`, `docs/prd/prd-draft.md` → `docs/prd/prd-draft-validation.md`. 같은 이름이 이미 있으면 덮어씁니다 (이전 결과는 git 기록) |

203·407행의 `<원본 이름>-validation.md`는 규칙과 같으므로 그대로.

### 3. `CLAUDE.md` 19행

지금: `PRD 작성은 prd-generator 에이전트, 검증은 prd-validator 에이전트 순서로 한다. 둘 다 docs/prd/에 저장한다 (검증 결과는 <이름>-validation.md)`

바꾼 뒤: `PRD 작성은 prd-generator 에이전트, 검증은 prd-validator 에이전트 순서로 한다. PRD는 docs/prd/prd.md 하나만 둔다 (이미 있으면 새 초안은 prd-draft.md로 만들어 비교·반영 뒤 지운다). 검증 결과는 <PRD 이름>-validation.md (예: prd-validation.md). 날짜는 파일 이름이 아니라 문서 첫머리에 적는다`

### 4. PRD를 읽는 다른 에이전트 2개

- `.claude/agents/starter-cleaner.md` 19행: `docs/prd/에서 파일 이름의 날짜가 가장 최신인 *-prd.md (-validation.md는 제외)` → `docs/prd/prd.md`
- `.claude/agents/development-planner.md` 14행: `없으면 docs/prd/prd.md. 그것도 없으면 docs/prd/에서 파일 이름의 날짜가 가장 최신인 *-prd.md (-validation.md는 제외).` → `없으면 docs/prd/prd.md.` (옛 이름 fallback 삭제)

### 5. 계획 파일

이 파일을 `plans/2026-10-10-project-notion-cms-prd-naming-plan.md`로 이름을 바꾸고, 완료 후 완료 상태를 적는다.

## 검증

```bash
grep -rn "<날짜>-<프로젝트>\|\*-prd\.md\|2026-10-09-foo\|2026-10-09-payment\|2026-10-09-project-prd\|최근 PRD를 찾습니다" .claude/agents CLAUDE.md   # 0건
grep -rn "prd-draft" .claude/agents/prd-generator.md .claude/agents/prd-validator.md CLAUDE.md | wc -l   # 1건 이상
head -8 .claude/agents/prd-generator.md .claude/agents/prd-validator.md | grep -c '^---$'   # 4 (프런트매터 쌍 유지)
```

코드 변경이 없으므로 lint·build는 돌리지 않는다. 에이전트 실제 동작은 다음에 PRD를 다시 만들 때 확인한다.

## 범위 밖

- `plans/` 안의 옛 계획 파일에 남은 옛 PRD 경로는 기록이므로 고치지 않는다
- 커밋은 `/ship`. 올릴 파일: 에이전트 4개, `CLAUDE.md`, 이 계획 파일

## 완료 상태 (2026-10-10)

### 완료한 항목

- `prd-generator`: 저장 위치 `docs/prd/prd.md`, 이미 있으면 `prd-draft.md`, 초안까지 있으면 보고만. 날짜는 문서 첫머리. description·절차·마무리 안내 문구 모두 수정
- `prd-validator`: 기본 입력 `docs/prd/prd.md`, 출력 예시를 `prd-validation.md`·`prd-draft-validation.md`로, description 예시 3곳 수정
- `starter-cleaner`·`development-planner`: PRD 읽는 경로를 `docs/prd/prd.md`로 단순화 (옛 이름 fallback 삭제)
- `CLAUDE.md` 19행: 새 규칙 한 줄로 교체

### 검증 결과

- 옛 규칙 문구(`<날짜>-<프로젝트>`, `*-prd.md`, 예시의 옛 날짜 경로, "최근 PRD를 찾습니다") 0건, `prd-draft` 언급 8건, 두 에이전트 프런트매터 쌍 유지
- 코드 변경 없음 → lint·build 생략

### 남은 작업

- `/ship`으로 커밋 (에이전트 4개, `CLAUDE.md`, 이 계획 파일)
- 에이전트 실제 동작은 다음에 PRD를 다시 만들거나 검증할 때 확인
