#!/bin/bash
# Claude가 턴(답변)을 끝낼 때 도는 Stop hook
# src/와 설정 파일에 커밋하지 않은 변경이 있으면 CLAUDE.md "작업 완료 체크리스트"의
# `npm run check-all`과 `npm run build`를 자동으로 돌린다
#
# 동작 규칙
# - 변경이 없으면 바로 통과 (질문·답변만 한 턴은 1초 안에 끝난다)
# - 변경 내용의 지문(해시)이 마지막으로 통과한 지문과 같으면 다시 검사하지 않는다
# - 실패하면 종료 코드 2 + stderr → Claude Code가 턴을 끝내지 않고 Claude에게 오류를 전달해 이어서 고치게 한다
# - 이미 한 번 막혀서 고친 뒤 다시 끝내는 턴(stop_hook_active=true)에서 또 실패하면 막지 않고
#   systemMessage로 사용자에게만 알린다 (무한 반복 방지, 자동 재시도 1회)

# Claude Code가 표준 입력으로 넘겨주는 JSON에서 "이미 Stop hook 때문에 이어진 턴인지" 꺼낸다
input=$(cat)
active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false')

cd "$CLAUDE_PROJECT_DIR" || exit 0

# 검사 대상 경로: 코드와, 바뀌면 build 결과가 달라지는 설정 파일들
paths=(src package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs postcss.config.mjs)

# 1) 커밋하지 않은 변경이 하나도 없으면 검사할 것이 없다
[ -n "$(git status --porcelain -- "${paths[@]}" 2>/dev/null)" ] || exit 0

# 2) 변경 내용의 지문 만들기: 추적 중인 파일의 diff + 아직 git에 없는 새 파일의 내용
fingerprint=$(
  {
    git diff HEAD -- "${paths[@]}"
    git ls-files --others --exclude-standard -- "${paths[@]}" | while IFS= read -r f; do
      printf '%s\n' "$f"
      cat "$f"
    done
  } | shasum -a 256 | cut -d' ' -f1
)

# 지문과 로그는 node_modules/.cache 아래에 둔다 (node_modules/는 git이 이미 무시한다)
cache_dir="node_modules/.cache/living-wishlist-check"
mkdir -p "$cache_dir"
ok_file="$cache_dir/last-ok"
log_file="$cache_dir/last.log"

# 3) 같은 지문이 이미 통과했으면 건너뛴다
[ -f "$ok_file" ] && [ "$(cat "$ok_file")" = "$fingerprint" ] && exit 0

# 4) 검사 실행. 출력은 로그 파일에 받아 두고 실패할 때만 일부를 보여 준다
if npm run check-all >"$log_file" 2>&1 && npm run build >>"$log_file" 2>&1; then
  printf '%s' "$fingerprint" >"$ok_file"
  exit 0
fi

# 5) 실패 처리
if [ "$active" = "true" ]; then
  # 이미 한 번 고친 뒤인데도 실패: 더 막지 않고 사용자에게 알린다
  printf '{"systemMessage":"lint·build 검사가 여전히 실패합니다. %s 를 확인하세요."}\n' "$log_file"
  exit 0
fi

# 첫 실패: 로그 마지막 60줄을 Claude에게 전달하고 턴 종료를 막는다
{
  echo "작업 후 자동 검사(npm run check-all && npm run build)가 실패했습니다. 아래 오류를 고치고 다시 끝내세요. 전체 로그: $log_file"
  echo "----"
  tail -n 60 "$log_file"
} >&2
exit 2
