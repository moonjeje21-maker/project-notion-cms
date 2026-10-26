# Task 009 구현 계획: 보류 중인 작은 수정 3건

## Context

명세는 `docs/roadmap/tasks/009-small-fixes.md`에 있고 여기엔 다시 적지 않는다. 이 계획은 실제 수정 순서와 확인 방법만 적는다.

MVP는 완료·배포됐다. 이 Task는 code-reviewer가 Task 004·005·006에서 "나중에"로 남긴 3건을 한 번에 처리한다. 셋 다 기능이 깨진 것은 아니며 화면 문구·구조·동작은 바꾸지 않는다. 고치는 파일이 서로 달라 충돌이 없다.

미리 확인한 사실(2026-10-25~26):

- `item-card.tsx` 50행 `alt={item.name}` — 링크 `<a>` 안에 `<p>{item.name}</p>`도 있어 접근성 이름에 이름이 두 번 들어간다
- `category-chips.tsx` 28행 바깥 `div.flex.gap-2.overflow-x-auto` — **포커스 링 잘림을 측정으로 확인함**(작업 파일 명세 2의 "사전 확인"): `:focus-visible` 참, ring 3px, 칩 줄 높이 28px = 칩 높이, padding 0, `overflow-y: auto`. 위아래와 첫 칩 왼쪽이 잘린다. 따라서 작업 파일 단계 4의 "확인 뒤 필요 시 developer 재호출"은 생략하고 **처음부터 함께 고친다**
- `notion.ts` `toSafeUrl`은 `startsWith` 두 번으로 검사해 `HTTPS://`·앞뒤 공백 주소를 버린다
- `src/components/ui/button.tsx`의 ring은 `focus-visible:ring-3`(3px), offset 없음. `py-1`/`px-1` = 4px > 3px
- dev 서버가 3000에 떠 있다(사용자 QA용). 브라우저 확인에 그대로 쓴다. 터미널 확인은 스크래치패드의 `ts-resolve-hook.mjs`(`node --import`)가 필요하다(메모리 `node-ts-terminal-check`)

## 결정 사항

1. **세 수정을 developer 한 번에**: `item-card.tsx`(alt), `category-chips.tsx`(여백), `notion.ts`(toSafeUrl). 작업 파일 단계 1·2·3 + 단계 4의 수정 부분
2. **칩 여백**: 바깥 `div`에 `py-1 -my-1 px-1 -mx-1`. 음수 여백으로 상쇄해 겉보기 위치·간격은 그대로(칩 줄의 바깥 치수 불변). 가로 스크롤 영역이 좌우 4px 넓어지지만 틀 여백(16px) 안이라 보이는 차이 없음
3. **`toSafeUrl`**: `const trimmed = value.trim()` → `/^https?:\/\//i.test(trimmed) ? trimmed : ""`. 대문자 스킴은 그대로 보존(브라우저가 처리). `null`·빈 값은 기존대로 `""`
4. **alt**: `alt=""` + 주석("이름은 아래 <p>가 전달하므로 이미지는 장식으로 둔다 — 링크 이름에 이름이 두 번 들어가지 않게"). 대체 그림 쪽은 이미 `aria-hidden`이라 그대로

## 수정 순서

1. **구현 (developer)**: 작업 파일·이 계획 경로를 넘긴다. 세 파일 수정 → `npm run lint` → `npm run check-all` → `npm run build`(라우트 표 `○ /  Revalidate 5m`) → 터미널 `toSafeUrl` 확인(훅 사용, 기대값 배열은 작업 파일 명세 3) → 작업 파일 단계 1·2·3·6 체크, 상태 `진행 중`
2. **브라우저 확인 (메인 대화, headless Chrome, dev 서버 3000)**:
   - 포커스: Tab으로 칩 포커스 → `:focus-visible` 참, 칩 줄 `paddingTop/Bottom` 4px, 칩 상자가 칩 줄 안쪽으로 위아래·왼쪽 모두 ≥3px 들어가 있음(= 잘리지 않음). 칩 줄의 바깥 치수와 첫 칩의 화면 위치가 수정 전(top 동일)과 같음. 확대 스크린샷 `task-009-focus.png`
   - 카드: 정상 이미지 카드의 `img.alt === ""`, 링크 `<a>`의 접근성 이름(`aria` 스냅샷 또는 `textContent`)에 소품 이름이 1회. 대체 그림 카드는 변화 없음. 전체 스크린샷 `task-009-desktop.png`를 Task 008 배포 스크린샷과 비교해 회귀 없음(카드·칩 모양 동일)
   - 콘솔 오류 0
3. **작업 파일 마무리**: 단계 4·5·7과 완료 기준 체크, 상태 `완료`, 변경 요약(포커스 링은 "사전 측정으로 잘림 확인 → 여백 추가 → 수정 후 측정값"으로 기록)
4. **계획 파일**: `plans/2026-10-26-project-notion-cms-task-009-plan.md`로 옮기고 완료 상태
5. **ROADMAP**: `development-planner`에게 "Task 009 완료로 바꿔줘"(Phase 5 ✅, "보류 중인 작은 수정" 소절을 처리 완료로). 커밋은 `/ship`(src 변경이라 code-reviewer 필수)

## 검증

- lint 경고 0 · check-all · build 통과, `/` `○` Revalidate 5m (developer 보고)
- 터미널: `[" https://a.com ", "HTTPS://A.com", "http://a.com", "javascript:alert(1)", "a.com", "", null]` → `["https://a.com", "HTTPS://A.com", "http://a.com", "", "", "", ""]`
- 브라우저: 위 2단계 항목 전부. 수정 전 기준값(2026-10-25 측정): 칩 줄 clientHeight 28, 칩 top 오프셋 0 → 수정 후 칩 top 오프셋 4, 칩 줄 바깥 높이(`getBoundingClientRect().height`) 28 유지
- `git status --short`: `item-card.tsx`·`category-chips.tsx`·`notion.ts` + 문서(작업 파일·ROADMAP·계획)만. `.env.local` 미수정

## 범위 밖

- 이미지 자동 수집(MVP 제외), "MVP 이후" 항목
- `error.tsx`·`page.tsx`·`wishlist-view.tsx`·`item-grid.tsx`·`items.ts` 변경 없음

## 완료 상태 (2026-10-26)

- ✅ 1단계: developer가 세 파일 수정. lint·check-all·build 통과(`/` `○` Revalidate 5m), 터미널 `toSafeUrl` 기대값 일치
- ✅ 2단계: 브라우저 — 칩 inset 4px(위·아래·왼쪽), 겉보기 위치 불변, `:focus-visible` 참 / 이미지 카드 `alt=""`, 접근성 이름에 이름 1회, 두 번 들어간 링크 0 / 콘솔 오류 0 / 회귀 없음
- ✅ 3단계: 작업 파일 완료
- ✅ 4·5단계: 이 파일 완료 상태 기록, ROADMAP 갱신(Task 009 ✅·Phase 5 ✅), code-reviewer 승인(고칠 것 없음, 나중 과제: 스킴만 있는 `https://` 통과) 뒤 `/ship`으로 올림

## 남은 작업

- 없음. Phase 5(다듬기)까지 전부 완료. 다음은 ROADMAP "제외 (MVP 이후)" 항목 중 선택
