# Task 009: 보류 중인 작은 수정 3건 처리하기

담당 기능: F002, F003, F004 (기존 기능 다듬기, 새 기능 ID 없음) · Phase 5 · 상태: 대기

## 맥락

MVP 전체가 완료되어 배포돼 있다(`https://project-notion-cms.vercel.app`). 이 Task는 code-reviewer가 Task 004·005·006 리뷰에서 "나중에"로 남긴 작은 수정 3건을 한 번에 처리한다. 고치는 파일이 셋 다 달라 서로 충돌하지 않는다. 셋 다 기능이 깨진 것은 아니므로 **화면 문구·구조·동작은 바꾸지 않는다.**

## 목표

(1) 링크 카드에서 스크린리더가 소품 이름을 두 번 읽지 않게 하고, (2) 종류 칩의 키보드 포커스 링이 잘리는지 확인해 잘리면 고치고, (3) `HTTPS://…`나 앞뒤 공백이 붙은 주소도 링크로 살린다. 화면은 이전과 똑같이 보여야 한다.

## 관련 파일

- 고칠 파일:
  - `src/components/features/wishlist/item-card.tsx` — 50행 `alt={item.name}` (수정 1)
  - `src/lib/notion.ts` — 51~55행 `toSafeUrl` (수정 3)
  - `src/components/features/wishlist/category-chips.tsx` — 25~29행 바깥 `div` (수정 2, 확인 결과 잘릴 때만)
- 참고할 기존 코드:
  - `item-card.tsx`: 바깥 `<a>`(74~81행)/`<div>`(86행) 분기, 이름 `<p className="line-clamp-2 text-sm font-semibold">`(58행), 대체 그림 `ImageOff aria-hidden="true"`(이미 장식), ref 콜백 `markIfAlreadyFailed`(25~29행, 건드리지 않음)
  - `category-chips.tsx`: 바깥 `div role="group" aria-label="종류 필터" className="flex gap-2 overflow-x-auto"`, 칩 `Button size="sm" className="shrink-0 rounded-full"`
  - `src/components/ui/button.tsx` 7행: `outline-none … focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` — ring 두께 **3px**(Tailwind 4 `ring-3`), `ring-offset` 없음. 즉 버튼 테두리 바깥으로 **3px**가 그려진다
  - `notion.ts`: 호출처는 `readUrl`(66~70행, `toSafeUrl(prop.url)`). `상품 링크`와 `이미지 URL` 둘 다 이 함수를 거친다
- 읽을 규칙: `CLAUDE.md` "코드 규칙"(큰따옴표, 세미콜론 없음, 토큰 색, 한국어 주석)
- 리뷰 근거: `docs/roadmap/tasks/004-item-card-exception-states.md`·`006-notion-items-mapping.md` 변경 요약의 code-reviewer 메모, ROADMAP Task 005·006의 "미확인 메모"

## 명세

1. **카드 접근성 이름 중복** (`item-card.tsx`): 링크 `<a>` 안에 `<img alt={item.name}>`과 `<p>{item.name}</p>`이 함께 있어 스크린리더가 이름을 두 번 읽는다.
   - `alt={item.name}` → `alt=""`로 바꿔 이미지를 장식으로 처리한다. 이름은 `<p>`가 전달한다
   - `alt` 줄 근처에 이유를 한국어 주석 한 줄로 적는다 (예: 이름은 아래 `<p>`가 알려 주므로 이미지는 장식)
   - 대체 그림 쪽(`ImageOff aria-hidden`)은 이미 장식이라 그대로 둔다
   - 링크 없는 `<div>` 카드도 같은 `<img>`를 쓰므로 함께 적용된다 (링크가 아니라 중복은 없지만 일관성)
   - Task 003 작업 파일의 "alt는 소품 이름" 명세는 역사 기록이라 고치지 않고, 이 Task의 변경 요약에 "바뀐 결정"으로 적는다
2. **칩 포커스 링 잘림 (미확인)** (`category-chips.tsx`): 바깥 `div`가 `overflow-x-auto`라 브라우저가 `overflow-y`도 `auto`로 바꾸므로, Tab 키 포커스 시 `focus-visible` ring(3px)이 위아래로 잘릴 수 있다.
   - **먼저 확인한다** (코드에 확인용 변경을 넣지 않는다): 브라우저에서 Tab으로 칩에 포커스를 주고 ring이 잘리는지 본다. 브라우저 도구가 없으면 headless Chrome 스크립트로 `page.keyboard.press("Tab")`을 반복한 뒤 칩 스크린샷
   - 잘리면: 바깥 `div`에 `py-1`(4px, ring 3px보다 큼)을 주고 레이아웃 간격이 벌어지지 않게 `-my-1`로 상쇄한다
   - 안 잘리면: 코드 변경 없이 "확인 결과 잘리지 않음"을 변경 요약에 기록하고 끝낸다
  - **사전 확인(2026-10-25, 메인 대화, dev 서버 headless Chrome)**: Tab으로 "전체" 칩에 포커스 → `:focus-visible` 참, `--tw-ring-shadow`가 3px로 설정됨. 칩 줄(`role="group"`)의 `clientHeight` 28px = 칩 높이 28px, 위아래 padding 0, `overflow-y: auto`. 즉 칩 바깥 3px에 그려지는 ring이 칩 줄 상자 밖이라 **위아래가 잘린다(확인됨)**. 첫 칩은 왼쪽 가장자리도 칩 줄과 맞닿아 **왼쪽 3px도 잘린다**. 따라서 2번은 확인 생략하고 바로 수정한다: 바깥 `div`에 `py-1 -my-1`(위아래)과 `px-1 -mx-1`(좌우)을 함께 준다(4px > 3px). 스크린샷 `.playwright-mcp/task-009-focus-precheck.png`·`-zoom.png`(참고용, 확대가 작아 눈으로는 불명확 — 판단은 측정값 기준)
3. **`toSafeUrl` 대소문자·공백** (`notion.ts`): 현재 `startsWith("http://")`/`startsWith("https://")`라 `HTTPS://…`나 앞뒤 공백이 붙은 주소가 `""`가 되어 링크가 조용히 사라진다 (보안은 fail-closed라 문제없고 사용성 문제).
   - 수정: `if (!value) return ""` 다음에 `const trimmed = value.trim()`, `/^https?:\/\//i.test(trimmed)`이면 `trimmed`를 돌려주고 아니면 `""`
   - 빈 문자열·null·`javascript:`·접두어 없는 값은 계속 `""`. 대문자 스킴은 그대로 보존한다(브라우저가 처리). 함수 위 주석도 현행화
   - 기대값: `[" https://a.com ", "HTTPS://A.com", "http://a.com", "javascript:alert(1)", "a.com", "", null]` → `["https://a.com", "HTTPS://A.com", "http://a.com", "", "", "", ""]`
   - 터미널 실행 메모: Node ESM은 `@/` 별칭을 못 풀어 그대로는 실패한다. Task 006처럼 프로젝트 밖 스크래치패드의 resolve 훅(`node --import <훅>`)이 필요하다 (`tsconfig.json` 등 프로젝트 파일은 바꾸지 않는다)

## 구현 단계

- [ ] 1. (developer) `item-card.tsx` 50행 `alt={item.name}` → `alt=""` + 이유 주석 한 줄
- [ ] 2. (developer) `notion.ts` `toSafeUrl`을 `trim()` + `/^https?:\/\//i` 방식으로 교체, 주석 현행화. (2번 수정용 확인 코드는 넣지 않는다)
- [ ] 3. `npm run lint` → `npm run check-all` → `npm run build` (라우트 표에서 `/` `○` Revalidate 5m 유지 확인)
- [ ] 4. (메인 대화) 브라우저에서 Tab 키로 칩 포커스 링이 잘리는지 확인. 잘리면 developer를 다시 불러 `category-chips.tsx` 바깥 `div`에 `py-1 -my-1` 추가. 스크린샷 `.playwright-mcp/task-009-focus.png`
- [ ] 5. (메인 대화) 카드 확인: DOM에서 `img[alt=""]`가 정상 이미지 카드에 있고, 링크 `<a>`의 접근성 이름에 소품 이름이 한 번만 들어가는지. 카드 화면이 Task 004 스크린샷과 같은지(회귀 없음). 스크린샷 `.playwright-mcp/task-009-desktop.png`
- [ ] 6. 터미널에서 `toSafeUrl` 기대값 확인 (스크래치패드 resolve 훅 사용)
- [ ] 7. `git status`·`git diff --stat`으로 변경 파일 확인, `.env.local` 미수정 확인

## 완료 기준

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과 (`/` `○` Revalidate 5m 유지)
- [ ] 브라우저 확인: 정상 이미지가 `<img alt="">`, 링크 카드의 접근성 이름에 소품 이름이 1회
- [ ] 브라우저 확인: 칩 포커스 링 확인 결과 기록 (잘림 여부와 조치)
- [ ] 터미널 확인: `toSafeUrl` 기대값 일치
- [ ] 화면 회귀 없음: 카드·칩 모양이 이전과 동일 (칩 간격이 벌어지지 않음)
- [ ] 변경 파일이 `item-card.tsx`·`notion.ts`(+ 잘렸을 때만 `category-chips.tsx`)뿐이고 `.env.local`은 수정하지 않음

## 범위 밖 메모

- 상품 링크에서 이미지 자동 수집(MVP 제외)과 ROADMAP "제외 (MVP 이후)" 항목 전부는 하지 않는다
- 배포는 `/ship`으로 `main`에 병합하면 자동으로 이뤄진다

## 변경 요약

(완료 후 작성: 바뀐 파일, 결정 사항, 남긴 일)
