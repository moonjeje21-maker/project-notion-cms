#!/bin/bash
# Edit/Write 도구로 파일을 고친 직후에 도는 PostToolUse hook
# 고친 파일이 src/ 아래 .ts/.tsx 파일이면 그 파일 하나만 eslint(코드 규칙 검사기)로 검사한다
# 실패하면 종료 코드 2 + stderr 문구 → Claude Code가 그 문구를 Claude에게 전달해 바로 고치게 한다
# 그 외(src/ 밖, .md 등)는 종료 코드 0으로 조용히 통과

# Claude Code가 표준 입력으로 넘겨주는 JSON에서 고친 파일 경로를 꺼낸다
input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$file" ] || exit 0

# 프로젝트 안 src/ 아래의 .ts/.tsx 파일만 검사 대상
case "$file" in
  "$CLAUDE_PROJECT_DIR"/src/*.ts|"$CLAUDE_PROJECT_DIR"/src/*.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0

# 통과하면 아무 말 없이 끝낸다
out=$(npx eslint "$file" 2>&1) && exit 0

# 실패: 파일 이름(프로젝트 기준 상대 경로)과 eslint 출력을 Claude에게 전달
printf 'eslint 오류 (%s):\n%s\n' "${file#"$CLAUDE_PROJECT_DIR"/}" "$out" >&2
exit 2
