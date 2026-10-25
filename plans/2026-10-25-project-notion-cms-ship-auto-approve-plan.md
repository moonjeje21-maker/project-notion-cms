# ship 스킬: `/ship` 실행을 최종 승인으로 만들기

## Context

지금 `/ship`은 4단계에서 브랜치 이름·파일 목록·커밋 메시지를 보여 주고 사용자의 답을 기다린다. 또 전역 규칙 `~/.claude/CLAUDE.md`가 "커밋·푸시 전에는 항상 확인을 기다려라(미리 요청했어도)"라고 정해 두어, 스킬만 고쳐도 다시 묻게 된다.

사용자의 요구: **`/ship`을 실행한 것 자체가 최종 승인**이다. 중간에 묻지 않고 끝까지 올린 뒤 결과를 보고한다. 작업과 무관해 보이는 파일은 묻지 않고 **자동으로 빼고**, 마지막 보고에 뺀 파일을 적는다.

안전 전제: 스킬 머리말의 `disable-model-invocation: true`(Claude가 스스로 `/ship`을 부를 수 없고 사용자만 부를 수 있음)는 그대로 유지한다. 그래서 "실행 = 승인"으로 봐도 안전하다.

## 바꾸는 파일 3개

### 1. `~/.claude/CLAUDE.md` (전역 규칙, 홈 폴더 `home-config` 저장소)

5번째 줄을 아래처럼 바꾼다.

```
- Before any `git commit` or `git push`, show what will be committed or pushed (files and a short summary of the changes) and wait for my confirmation, even if I asked to commit earlier. Exception: when I run `/ship` myself, that invocation is the approval — show the summary but do not wait.
```

이 저장소의 커밋은 `/ship` 대상이 아니므로 기존 규칙대로 커밋 전에 보여 주고 확인을 받는다.

### 2. `.claude/skills/ship/SKILL.md`

머리말(frontmatter)은 그대로 둔다. 본문을 아래 요지로 고친다.

**첫 문단**

```
작업 폴더의 변경을 `main`에 올린다. 사용자가 `/ship`을 실행한 것이 최종 승인이다. 아래 6단계를 순서대로 멈추지 않고 실행하고, 중간에 사용자에게 묻지 않는다. 멈추는 경우는 "지킬 것"의 실패 조건뿐이다.
```

**"지킬 것"에 한 줄 추가**

```
- 전역 규칙의 "커밋·푸시 전 확인"은 `/ship`에서는 적용하지 않는다. `/ship` 실행이 그 확인이다
```

**1단계 표** — "4단계 확인 뒤"를 "4단계 정리 뒤"로 두 군데 바꾼다.

**4단계 제목·본문 교체** — `## 4. 확인 (한 번)` → `## 4. 올릴 내용 정리 (묻지 않음)`

```
아래를 정하고 사용자에게 보여 준 뒤, 답을 기다리지 않고 바로 5단계로 간다.

- 브랜치 이름: `feat/…`, `fix/…`, `chore/…` 뒤에 짧은 영어 kebab-case. 이미 작업 브랜치에 있으면 그 이름
- 올릴 파일 목록과 변경 요약
- 커밋 메시지와 PR 제목 (영어)

**무관한 파일 자동 제외**: 이 대화에서 작업한 변경이나 `$ARGUMENTS`의 설명과 관계없는 파일(다른 기능의 파일, 우연히 바뀐 설정 등)은 묻지 않고 올릴 목록에서 뺀다. 뺀 파일은 작업 트리에 그대로 두고 6단계 보고에 적는다. 예외: `AGENTS.md`는 `next dev`가 다시 만드는 파일이라 바뀌었으면 함께 올린다 (파일 안의 안내대로).
```

**5단계 2번** — `git add <확인받은 파일>` → `git add <4단계에서 정한 파일>`

**6단계 3번** — 보고 항목에 "4단계에서 뺀 파일이 있으면 그 목록과 이유"를 추가한다.

### 3. `CLAUDE.md` (프로젝트)

"사용자는 `/ship`으로 부른다" 뒤에 덧붙인다.

```
… 사용자는 `/ship`으로 부른다. `/ship` 실행이 최종 승인이므로 커밋·푸시 전에 다시 묻지 않는다
```

## 하지 않는 것

- hook(`block-main-commit.sh`)과 `settings.json`은 바꾸지 않는다. `main`에서의 커밋만 막고 브랜치에서는 간섭하지 않는다
- lint·build 실패, code-reviewer "승인" 아님, `main`에 푸시 안 된 커밋 등 기존 **멈춤 조건은 유지**한다. 이것은 승인이 아니라 오류 보고다

## 순서

1. 계획 승인 후 이 파일을 `plans/2026-10-25-project-notion-cms-ship-auto-approve-plan.md`로 옮긴다 (프로젝트 규칙의 파일 이름 형식)
2. 위 3개 파일을 고친다
3. 확인: `SKILL.md`·`CLAUDE.md` 두 파일을 다시 읽어 "확인을 기다린다" 문구가 남지 않았는지 `grep -n "기다린" .claude/skills/ship/SKILL.md`로 본다
4. 프로젝트 변경(`SKILL.md`, `CLAUDE.md`, `plans/…`)은 사용자가 `/ship`을 실행해 올린다. 그때 새 규칙대로 묻지 않고 끝까지 가는지가 곧 동작 확인이다. 전역 `~/.claude/CLAUDE.md`는 `home-config` 저장소에서 기존 규칙대로 확인을 받은 뒤 따로 커밋한다

## 확인 방법

- 바뀐 파일은 모두 `.md`라서 lint·build 대상이 아니다. Stop hook도 `src/`·설정 파일만 보므로 돌지 않는다
- 실제 동작 확인은 4번의 `/ship` 실행: 4단계에서 멈추지 않고 PR 병합까지 가고, 마지막 보고에 PR 주소가 나오면 성공

## 진행 상태 (2026-10-25)

완료:
- `~/.claude/CLAUDE.md` 5번째 줄에 `/ship` 예외 추가
- `.claude/skills/ship/SKILL.md` 첫 문단·지킬 것·1단계 표·4단계·5단계 2번·6단계 3번 수정. 옛 문구("기다린다", "확인받은", "뺄지 묻는다")가 남지 않은 것을 grep으로 확인
- 프로젝트 `CLAUDE.md`에 "`/ship` 실행이 최종 승인" 한 줄 추가

남은 작업:
- 사용자가 `/ship`을 실행해 프로젝트 변경(`SKILL.md`, `CLAUDE.md`, 이 계획 파일)을 올린다. 그때 4단계에서 멈추지 않고 병합까지 가는지가 동작 확인이다
- `~/.claude/CLAUDE.md`는 홈 폴더 `home-config` 저장소에서 따로 커밋한다 (`/ship` 대상이 아니므로 기존 규칙대로 확인 뒤)
