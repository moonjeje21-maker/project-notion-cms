#!/bin/bash
# developer 에이전트가 돌 때만 붙는 PreToolUse hook (.claude/agents/developer.md의 프런트매터 hooks에서 부른다)
# 1) Bash: git 쓰기 명령, 패키지 설치·삭제·업그레이드 명령을 막는다
# 2) Edit/Write: 설정 파일, .claude/, ROADMAP·PRD, shadcn ui 부품, .env 파일 편집을 막는다
# 막을 때는 종료 코드 2 + stderr 문구 (Claude에게 전달됨). 그 외는 0으로 통과
# 한계: 명령 글자만 보므로 sh -c나 변수로 감춘 명령은 잡지 못한다. 글자 규칙(에이전트 본문)과 함께 쓰는 이중 장치다

# Claude Code가 표준 입력으로 넘겨주는 JSON에서 도구 이름을 꺼낸다
input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')

# 막을 때 쓰는 함수: 사유를 stderr로 알리고 종료 코드 2로 실행을 막는다
block() { echo "$1" >&2; exit 2; }

case "$tool" in
  Bash)
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

    # git 쓰기 명령 (status·diff·log는 통과)
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])git[[:space:]]+(add|commit|push|switch|checkout|stash|reset|restore|merge|rebase|rm|mv|clean|cherry-pick|tag)([[:space:]]|$)'; then
      block "developer 에이전트는 git 쓰기 명령을 쓰지 않습니다. 커밋은 사용자가 /ship으로 합니다. git status·diff·log만 쓰세요"
    fi

    # git branch는 읽기 옵션(--show-current, --list, -a/-l/-r/-v)만 통과
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])git[[:space:]]+branch' \
      && ! printf '%s' "$cmd" | grep -qE 'git[[:space:]]+branch[[:space:]]+(--show-current|--list|-[alrv]+)([[:space:]]|$)'; then
      block "developer 에이전트는 브랜치를 만들거나 지우지 않습니다 (git branch --show-current·--list만 허용)"
    fi

    # 패키지 설치·삭제·업그레이드 (npm run·npm outdated·npm view는 통과)
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])npm[[:space:]]+(install|i|ci|add|uninstall|remove|rm|un|update|up|upgrade|dedupe|link|audit[[:space:]]+fix)([[:space:]]|$)'; then
      block "developer 에이전트는 패키지를 설치·삭제·업그레이드하지 않습니다. 필요한 패키지와 이유를 보고하세요 (.claude/rules/dependencies.md)"
    fi

    # next 업그레이드, shadcn 부품 추가 (npx shadcn docs <이름>, npx next typegen, npx eslint는 통과)
    if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_.-])npx[[:space:]]+(next[[:space:]]+upgrade|shadcn(@[^[:space:]]*)?[[:space:]]+add)([[:space:]]|$)'; then
      block "developer 에이전트는 next upgrade·shadcn add를 실행하지 않습니다. 필요한 부품 이름을 보고하세요 (npx shadcn docs <이름>은 허용)"
    fi
    ;;

  Edit|Write)
    path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

    # 설정 파일·.claude/·ROADMAP·PRD·shadcn ui 부품·.env 파일은 고치지 않는다
    if printf '%s' "$path" | grep -qE '(^|/)(package\.json|package-lock\.json|next\.config\.ts|eslint\.config\.mjs|tsconfig\.json|\.mcp\.json|CLAUDE\.md|AGENTS\.md)$|(^|/)\.claude/|(^|/)docs/roadmap/ROADMAP\.md$|(^|/)docs/prd/|(^|/)src/components/ui/|(^|/)\.env'; then
      block "developer 에이전트는 이 파일을 고치지 않습니다: $path (설정 파일·.claude/·ROADMAP·PRD·components/ui·.env). 필요하면 이유를 보고하세요"
    fi
    ;;
esac

exit 0
