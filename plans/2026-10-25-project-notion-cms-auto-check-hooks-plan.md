# 작업 후 lint·build 자동 실행 (Claude Code hook)

작성일: 2026-10-25 · 프로젝트: project-notion-cms · 상태: 완료 (2026-10-25)

## 배경 (Context)

- 지금은 lint와 build가 developer 에이전트의 순서표와 `/ship` 스킬 안에만 적혀 있어서, 그 순서를 따를 때만 실행된다. 메인 대화에서 파일을 고치고 그냥 턴을 끝내면 아무 검사도 돌지 않는다.
- 사용자 요청: "lint·build가 자동 실행되도록 해줘" — 사람이 잊어도 기계가 돌리는 장치를 원한다.
- 해법은 Claude Code **hook**(정해진 순간에 자동으로 도는 셸 명령). 이미 `.claude/settings.json`에 `PreToolUse` hook 하나(`block-main-commit.sh`)가 있으므로 같은 방식으로 두 개를 더한다.
- GitHub Actions(PR마다 서버에서 빌드)는 이번 범위에 넣지 않는다. Task 006부터 build가 Notion을 읽어야 해서 GitHub에 Notion 비밀 값을 등록해야 하고, `/ship`이 PR을 만든 즉시 병합하는 흐름도 바꿔야 하므로 별도 작업으로 둔다.

## 설계

두 겹으로 검사한다.

| 시점 | hook 이벤트 | 하는 일 | 걸리는 시간 |
|---|---|---|---|
| 파일 하나를 고친 직후 | `PostToolUse` (`Edit\|Write`) | 그 파일이 `src/` 아래 `.ts/.tsx`면 `npx eslint <파일>` 한 개만 | 수 초 |
| Claude가 턴을 끝낼 때 | `Stop` | `src/`나 설정 파일에 **커밋 안 된 변경**이 있고, 아직 통과 기록이 없으면 `npm run check-all && npm run build` | 1~2분 |

핵심 규칙:

- **실패하면 Claude에게 되돌려 준다.** hook이 종료 코드 2로 끝나면 Claude Code가 stderr 내용을 Claude에게 전달한다. `PostToolUse`에서는 lint 오류를 바로 보고 고치고, `Stop`에서는 턴이 끝나지 않고 Claude가 이어서 고친다.
- **같은 내용은 두 번 검사하지 않는다.** `Stop` hook은 변경 내용의 지문(해시)을 만들어 마지막으로 통과한 지문과 같으면 바로 통과시킨다. 그래서 코드를 고치지 않은 질문·답변 턴, 이미 통과한 변경이 남아 있는 턴에서는 1초 안에 끝난다.
- **무한 반복을 막는다.** `Stop` hook 입력의 `stop_hook_active`가 `true`면 "이미 한 번 막혀서 고친 뒤 다시 끝내는 턴"이다. 이때 또 실패하면 막지 않고(종료 코드 0) `systemMessage`로 사용자에게 "검사가 여전히 실패합니다"라고 알린다. 자동 재시도는 1회로 제한된다.
- **지문 저장 위치**: `node_modules/.cache/living-wishlist-check/last-ok` — `node_modules/`는 이미 git이 무시하므로 `.gitignore`를 건드리지 않는다.
- 변경 감지 범위: `src/`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`. `.md`나 `.claude/`만 바뀐 턴에서는 검사하지 않는다 (`/ship` 2단계의 "`.md`와 `.claude/`만이면 건너뛴다"와 같은 기준).
- 실행 명령은 CLAUDE.md "작업 완료 체크리스트"와 똑같이 `npm run check-all` → `npm run build`. 출력은 로그 파일에 받아 두고 실패 시 마지막 60줄만 stderr로 보낸다 (Claude 컨텍스트 낭비 방지).
- `Stop` hook의 `timeout`을 600초로 둔다 (기본 60초면 build 중 끊긴다).

## 수정·생성 파일

### 1. 새 파일 `.claude/hooks/lint-changed-file.sh` (PostToolUse)

```bash
#!/bin/bash
# Edit/Write 직후 고친 파일이 src/ 아래 .ts/.tsx면 그 파일만 eslint로 검사하는 hook
# 실패하면 종료 코드 2 + stderr → Claude가 바로 보고 고친다
input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$file" ] || exit 0
case "$file" in
  "$CLAUDE_PROJECT_DIR"/src/*.ts|"$CLAUDE_PROJECT_DIR"/src/*.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
out=$(npx eslint "$file" 2>&1) && exit 0
printf 'eslint 오류 (%s):\n%s\n' "${file#"$CLAUDE_PROJECT_DIR"/}" "$out" >&2
exit 2
```

### 2. 새 파일 `.claude/hooks/check-after-work.sh` (Stop)

흐름 (한국어 주석으로 각 단계 설명):

1. stdin JSON에서 `stop_hook_active` 읽기 (`jq -r '.stop_hook_active // false'`)
2. `cd "$CLAUDE_PROJECT_DIR"`; 감시 경로 목록을 변수로 둔다
3. 지문 만들기: `{ git diff HEAD -- <경로들>; git ls-files --others --exclude-standard -- <경로들> | while read -r f; do printf '%s\n' "$f"; cat "$f"; done; } | shasum -a 256 | cut -d' ' -f1`
   - 변경이 전혀 없으면(`git status --porcelain -- <경로들>`가 비어 있으면) `exit 0`
4. `node_modules/.cache/living-wishlist-check/last-ok`의 내용과 지문이 같으면 `exit 0`
5. 로그 파일(`node_modules/.cache/living-wishlist-check/last.log`)에 `npm run check-all && npm run build` 출력을 받는다
6. 통과: 지문을 `last-ok`에 저장, `exit 0`
7. 실패:
   - `stop_hook_active`가 `false`면 로그 마지막 60줄을 stderr로 내고 `exit 2` (Claude가 이어서 고친다)
   - `true`면 `{"systemMessage":"lint·build 검사가 여전히 실패합니다. node_modules/.cache/living-wishlist-check/last.log를 확인하세요."}`를 stdout으로 내고 `exit 0` (반복 중단, 사용자에게 알림)

### 3. 수정 `.claude/settings.json`

기존 `PreToolUse` 항목은 그대로 두고 두 이벤트를 **추가**한다 (덮어쓰지 않는다).

```json
{
  "hooks": {
    "PreToolUse": [ ...기존 그대로... ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/lint-changed-file.sh",
            "timeout": 60,
            "statusMessage": "고친 파일 eslint 검사 중…"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-after-work.sh",
            "timeout": 600,
            "statusMessage": "작업 후 lint·build 검사 중…"
          }
        ]
      }
    ]
  }
}
```

### 4. 문서 한 줄씩

- `CLAUDE.md` "작업 완료 체크리스트" 아래에: "턴이 끝날 때 `.claude/hooks/check-after-work.sh`(Stop hook)가 `src/`·설정 파일에 커밋 안 된 변경이 있으면 이 두 명령을 자동으로 돌린다. 실패하면 Claude가 이어서 고친다. 통과한 변경은 다시 검사하지 않는다"
- `README.md` "자주 쓰는 명령" 절 끝에 같은 내용을 비개발자 눈높이로 두 줄 (hook이 무엇인지 한 줄 정의 포함)
- `.claude/skills/ship/SKILL.md` 2단계 1번은 이미 "마지막 수정 뒤에 통과했으면 다시 돌리지 않는다"라서 그대로 둔다. 다만 한 구절 추가: "Stop hook이 통과시킨 경우도 통과로 본다"

### 5. 계획 파일 보관

승인 뒤 이 파일을 프로젝트 규칙 이름 `plans/2026-10-25-project-notion-cms-auto-check-hooks-plan.md`로 옮기고, 작업이 끝나면 완료 상태를 적는다.

## 검증 (구현 뒤)

1. 문법: `bash -n .claude/hooks/*.sh`, `jq empty .claude/settings.json`, `jq -e '.hooks.Stop[0].hooks[0].command' .claude/settings.json`
2. PostToolUse 파이프 테스트: `echo '{"tool_name":"Edit","tool_input":{"file_path":"'$PWD'/src/lib/site.ts"}}' | bash .claude/hooks/lint-changed-file.sh; echo $?` → 0. `src/` 밖 파일과 `.md` 파일로도 돌려 0 확인
3. Stop 파이프 테스트 (변경이 있는 지금 상태에서):
   - `echo '{}' | bash .claude/hooks/check-after-work.sh; echo $?` → check-all·build가 돌고 0, `last-ok` 파일 생성
   - 바로 다시 실행 → 1초 안에 0 (지문 캐시 동작)
   - `src/lib/site.ts`에 일부러 타입 오류 한 줄 추가 → 실행 → 종료 코드 2, stderr에 오류 요약. `echo '{"stop_hook_active":true}'`로 실행 → 종료 코드 0, stdout에 systemMessage JSON. 오류 줄 원복
4. 실제 hook 발화 확인: Edit 도구로 `src/` 파일에 사소한 변경 후 원복하며 "Ran 1 hook" 또는 오류 피드백이 보이는지 확인. 설정 감시가 `.claude/`를 아직 보지 않으면 사용자가 `/hooks`를 한 번 열거나 재시작해야 한다 (그 경우 안내)
5. `npm run check-all`, `npm run build` 최종 통과 확인

## 알려진 한계 (문서에 적을 것)

- Bash로 직접 파일을 고친 경우(`sed` 등) `PostToolUse` lint는 돌지 않는다. `Stop` hook이 어떤 방식으로 고쳤든 모두 잡아 주는 안전망이다
- developer 에이전트가 lint·build를 이미 통과시켰어도 지문 캐시는 hook만 갱신하므로, 메인 턴이 끝날 때 한 번 더 돈다 (1~2분). 이후 턴에서는 캐시로 건너뛴다
- Task 006부터 build가 Notion을 읽으므로 `.env.local`과 네트워크가 없으면 Stop hook도 실패한다 (기존 체크리스트와 같은 조건)

## 완료 상태 (2026-10-25)

- ✅ `.claude/hooks/lint-changed-file.sh`, `.claude/hooks/check-after-work.sh` 생성 (한국어 주석)
- ✅ `.claude/settings.json`에 `PostToolUse`(Edit|Write, timeout 60)·`Stop`(timeout 600) 추가. 기존 `PreToolUse`는 그대로
- ✅ `CLAUDE.md` 체크리스트 아래, `README.md` "자동 검사" 절, `/ship` 2단계 문구 반영
- ✅ 검증: `bash -n`·`jq` 통과. PostToolUse 파이프 테스트(src .ts → 0, .md → 0, eslint 오류 파일 → 2). Stop 파이프 테스트(변경 없음 → 즉시 0, 변경 있음 → check-all+build 약 7초 후 0, 같은 변경 재실행 → 0.04초, 타입 오류 → 2 + 오류 요약, stop_hook_active=true → 0 + systemMessage). Edit 도구로 실제 발화 확인(sentinel 파일)
- 참고: 이 프로젝트는 build가 약 6~7초라 Stop hook 부담이 작다. 테스트에 쓴 임시 변경·sentinel은 모두 원복
- 남은 작업: 없음. 선택 사항으로 PR마다 서버에서 검사하는 GitHub Actions는 별도 작업(Notion 비밀 값 등록과 `/ship` 병합 대기 추가 필요)
