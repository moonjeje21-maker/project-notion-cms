#!/bin/bash
# main 브랜치에서 Claude가 git commit / git push를 실행하지 못하게 막는 hook 스크립트

# Claude Code가 표준 입력으로 넘겨주는 JSON에서 명령을 꺼내, git commit·push가 아니면 통과시킨다
jq -r '.tool_input.command' | grep -qE 'git[[:space:]]+(commit|push)' || exit 0

# 현재 브랜치가 main이 아니면 통과시킨다
[ "$(git branch --show-current)" = "main" ] || exit 0

# 종료 코드 2 = 실행을 막고, 아래 문구를 Claude에게 전달한다
echo "main 브랜치에서는 commit/push를 하지 않습니다. 브랜치(feat/…, fix/…, chore/…)를 먼저 만드세요." >&2
exit 2
