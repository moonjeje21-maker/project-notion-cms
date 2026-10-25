---
name: ship
description: 지금 작업한 변경을 브랜치 → 커밋 → 푸시 → PR → 병합 → 브랜치 삭제까지 한 번에 올린다
disable-model-invocation: true
argument-hint: "[변경 설명 (선택)]"
---

작업 폴더의 변경을 `main`에 올린다. 사용자가 `/ship`을 실행한 것이 최종 승인이다. 아래 6단계를 순서대로 멈추지 않고 실행하고, 중간에 사용자에게 묻지 않는다. 멈추는 경우는 "지킬 것"의 실패 조건뿐이다.

사용자가 덧붙인 설명: $ARGUMENTS

## 지킬 것

- 단계가 실패하면 그 자리에서 멈추고 보고한다: 멈춘 단계, 지금 브랜치, 푸시 여부, PR 번호. 원인을 고친 뒤 `/ship`을 다시 부르면 1단계가 상태를 읽고 이어서 진행한다
- 실패를 강제 옵션으로 넘기지 않는다. `--force`, `--no-verify`, `--admin`, `git reset --hard`, `git branch -D`를 쓰지 않는다
- 명령은 하나씩 따로 실행한다. `.claude/hooks/block-main-commit.sh`는 명령 글자에 `git commit`·`git push`가 있으면 `main`에서 막으므로, 브랜치 만들기와 커밋을 `&&`로 묶으면 막힌다
- 전역 규칙의 "커밋·푸시 전 확인"은 `/ship`에서는 적용하지 않는다. `/ship` 실행이 그 확인이다

## 1. 상태 확인 (읽기만)

`git status --short`, `git branch --show-current`, `git fetch origin` 뒤 `git log --oneline HEAD..origin/main`과 `git log --oneline origin/main..HEAD`를 본다. 작업 브랜치에 있으면 `gh pr list --head <브랜치> --state open`도 본다.

| 상태 | 할 일 |
|---|---|
| 변경도 없고 올릴 커밋도 없다 | 올릴 것이 없다고 알리고 끝낸다 |
| `main`이 `origin/main`보다 뒤처져 있다 | `git pull --ff-only`로 맞추고 계속한다 |
| `main`에 푸시하지 않은 커밋이 있다 | 멈추고 보고한다 |
| 커밋하지 않은 변경이 있다 | 2단계부터 |
| 작업 브랜치에 커밋만 있고 PR이 없다 | 4단계 정리 뒤 5단계의 푸시부터 |
| 열린 PR이 이미 있다 | 4단계 정리 뒤 5단계의 병합부터 |

## 2. 검사

바뀐 파일이 `.md` 파일과 `.claude/` 아래뿐이면 1~2번을 건너뛴다.

1. `npm run lint`와 `npm run build`를 실행한다. 이 대화에서 마지막 수정 뒤에 둘 다 통과했으면(직접 돌렸든, 턴 끝의 Stop hook `check-after-work.sh`가 통과시켰든) 다시 돌리지 않는다
2. `src/` 아래가 바뀌었으면 `code-reviewer` 에이전트를 부른다. 바뀐 파일 경로, 변경 의도, `git diff` 결과, lint·build 결과를 넘긴다. 결론이 "승인"이 아니면 멈추고 리뷰 내용을 사용자에게 전한다
3. `.claude/` 아래의 `.json`·`.sh` 파일이 바뀌었으면 형식을 확인한다: `.json`은 `jq empty <파일>`, `.sh`는 `bash -n <파일>`

## 3. 계획 파일

이 작업의 계획 파일이 `plans/`에 있으면 진행 상태(완료한 것, 남은 작업)를 지금 적어 같은 PR에 넣는다. 완료 표시만 담은 PR을 따로 만들지 않는다. PR 번호는 아직 없으므로 적지 않는다.

## 4. 올릴 내용 정리 (묻지 않음)

아래를 정하고 사용자에게 보여 준 뒤, 답을 기다리지 않고 바로 5단계로 간다.

- 브랜치 이름: `feat/…`, `fix/…`, `chore/…` 뒤에 짧은 영어 kebab-case. 이미 작업 브랜치에 있으면 그 이름
- 올릴 파일 목록과 변경 요약
- 커밋 메시지와 PR 제목 (영어)

**무관한 파일 자동 제외**: 이 대화에서 작업한 변경이나 `$ARGUMENTS`의 설명과 관계없는 파일(다른 기능의 파일, 우연히 바뀐 설정 등)은 묻지 않고 올릴 목록에서 뺀다. 뺀 파일은 작업 트리에 그대로 두고 6단계 보고에 적는다. 예외: `AGENTS.md`는 `next dev`가 다시 만드는 파일이라 바뀌었으면 함께 올린다 (파일 안의 안내대로).

## 5. 올리기

1. `main`에 있으면 `git switch -c <브랜치>`
2. `git add <4단계에서 정한 파일>` (`git add -A`, `git add .`은 쓰지 않는다)
3. `git commit`
4. `git push -u origin <브랜치>`
5. `gh pr create --base main` (본문은 영어로 `## Summary`와 `## Testing`)
6. `gh pr merge --merge --delete-branch`

## 6. 마무리 확인과 보고

1. `main`이 아니면 `git switch main`, 이어서 `git pull --ff-only`
2. `gh pr view <번호> --json state,url`이 `MERGED`인지, `git status --short`가 비어 있는지, `git branch --list <브랜치>`와 `git ls-remote --heads origin <브랜치>`가 비어 있는지 본다
3. PR 주소와 결과를 한두 줄로 알린다. 어긋난 것이 있으면 그것을 먼저 적는다. 4단계에서 뺀 파일이 있으면 그 목록과 이유를 함께 적는다
