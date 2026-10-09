---
name: ship
description: 지금 작업한 변경을 브랜치 → 커밋 → 푸시 → PR → 병합 → 브랜치 삭제까지 한 번에 올린다
disable-model-invocation: true
argument-hint: "[변경 설명 (선택)]"
---

작업 폴더의 변경을 `main`에 올린다. 아래 6단계를 순서대로 실행하고, 사용자 확인은 4단계에서 한 번만 받는다.

사용자가 덧붙인 설명: $ARGUMENTS

## 지킬 것

- 단계가 실패하면 그 자리에서 멈추고 보고한다: 멈춘 단계, 지금 브랜치, 푸시 여부, PR 번호. 원인을 고친 뒤 `/ship`을 다시 부르면 1단계가 상태를 읽고 이어서 진행한다
- 실패를 강제 옵션으로 넘기지 않는다. `--force`, `--no-verify`, `--admin`, `git reset --hard`, `git branch -D`를 쓰지 않는다
- 명령은 하나씩 따로 실행한다. `.claude/hooks/block-main-commit.sh`는 명령 글자에 `git commit`·`git push`가 있으면 `main`에서 막으므로, 브랜치 만들기와 커밋을 `&&`로 묶으면 막힌다

## 1. 상태 확인 (읽기만)

`git status --short`, `git branch --show-current`, `git fetch origin` 뒤 `git log --oneline HEAD..origin/main`과 `git log --oneline origin/main..HEAD`를 본다. 작업 브랜치에 있으면 `gh pr list --head <브랜치> --state open`도 본다.

| 상태 | 할 일 |
|---|---|
| 변경도 없고 올릴 커밋도 없다 | 올릴 것이 없다고 알리고 끝낸다 |
| `main`이 `origin/main`보다 뒤처져 있다 | `git pull --ff-only`로 맞추고 계속한다 |
| `main`에 푸시하지 않은 커밋이 있다 | 멈추고 보고한다 |
| 커밋하지 않은 변경이 있다 | 2단계부터 |
| 작업 브랜치에 커밋만 있고 PR이 없다 | 4단계 확인 뒤 5단계의 푸시부터 |
| 열린 PR이 이미 있다 | 4단계 확인 뒤 5단계의 병합부터 |

## 2. 검사

바뀐 파일이 `.md` 파일과 `.claude/` 아래뿐이면 1~2번을 건너뛴다.

1. `npm run lint`와 `npm run build`를 실행한다. 이 대화에서 마지막 수정 뒤에 둘 다 통과했으면 다시 돌리지 않는다
2. `src/` 아래가 바뀌었으면 `code-reviewer` 에이전트를 부른다. 바뀐 파일 경로, 변경 의도, `git diff` 결과, lint·build 결과를 넘긴다. 결론이 "승인"이 아니면 멈추고 리뷰 내용을 사용자에게 전한다
3. `.claude/` 아래의 `.json`·`.sh` 파일이 바뀌었으면 형식을 확인한다: `.json`은 `jq empty <파일>`, `.sh`는 `bash -n <파일>`

## 3. 계획 파일

이 작업의 계획 파일이 `plans/`에 있으면 진행 상태(완료한 것, 남은 작업)를 지금 적어 같은 PR에 넣는다. 완료 표시만 담은 PR을 따로 만들지 않는다. PR 번호는 아직 없으므로 적지 않는다.

## 4. 확인 (한 번)

아래를 한 번에 보여 주고 답을 기다린다. 승인 전에는 브랜치를 만들지 않고 커밋도 하지 않는다.

- 브랜치 이름: `feat/…`, `fix/…`, `chore/…` 뒤에 짧은 영어 kebab-case. 이미 작업 브랜치에 있으면 그 이름
- 올릴 파일 목록과 변경 요약. 이 작업과 무관해 보이는 파일은 따로 표시하고 뺄지 묻는다
- 커밋 메시지와 PR 제목 (영어)
- 승인하면 병합과 브랜치 삭제까지 진행한다는 안내

## 5. 올리기

1. `main`에 있으면 `git switch -c <브랜치>`
2. `git add <확인받은 파일>` (`git add -A`, `git add .`은 쓰지 않는다)
3. `git commit`
4. `git push -u origin <브랜치>`
5. `gh pr create --base main` (본문은 영어로 `## Summary`와 `## Testing`)
6. `gh pr merge --merge --delete-branch`

## 6. 마무리 확인과 보고

1. `main`이 아니면 `git switch main`, 이어서 `git pull --ff-only`
2. `gh pr view <번호> --json state,url`이 `MERGED`인지, `git status --short`가 비어 있는지, `git branch --list <브랜치>`와 `git ls-remote --heads origin <브랜치>`가 비어 있는지 본다
3. PR 주소와 결과를 한두 줄로 알린다. 어긋난 것이 있으면 그것을 먼저 적는다
