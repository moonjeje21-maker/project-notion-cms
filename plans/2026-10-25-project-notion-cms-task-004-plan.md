# Task 004 구현 계획: 카드의 예외 상태 (대체 그림 · 새 탭 링크 · 링크 없는 카드)

## Context

명세는 `docs/roadmap/tasks/004-item-card-exception-states.md`에 있고 여기엔 다시 적지 않는다. 이 계획은 실제 수정 순서와 확인 방법만 적는다.

지금 `ItemCard`(Task 003)는 정상 데이터만 그린다. 그래서 더미 mock-3(이미지 URL 빈 문자열)은 `<img src="">`가 그려져 콘솔에 "An empty string was passed to the src attribute" 오류가 나고, mock-5(깨진 주소)는 깨진 이미지 아이콘이 보이고, 카드를 눌러도 상품 링크가 열리지 않는다. 이 Task는 `item-card.tsx` **한 파일**만 고쳐 F002(새 탭 링크)와 F004의 나머지(대체 그림·"기타" 배지)를 끝낸다. 끝나면 Phase 2(화면)가 완료된다.

미리 확인한 사실:

- 고칠 파일 `src/components/features/wishlist/item-card.tsx`는 `"use client"` 없이 `div > (이미지 div > img) + (글자 div > p + Badge)` 구조. 이 구조와 클래스는 그대로 두고 분기만 덧붙인다
- `src/lib/mock-items.ts`에 예외 4종(mock-3 이미지 없음, mock-5 깨진 주소, mock-7 링크 없음, mock-8 "기타")이 이미 있어 **임시 데이터 변경이 필요 없다**
- `Item.category`는 비어 있지 않게 보장되므로(`items.ts`) 배지는 `item.category` 그대로. "기타" 비교 분기 없음
- `wishlist-view.tsx`가 이미 클라이언트 컴포넌트라 `ItemCard`에 `"use client"`를 붙여도 번들 구조 변화 없음. `page.tsx`는 서버 컴포넌트 그대로라 `/`의 ISR(Revalidate 5m)은 유지돼야 한다
- `lucide-react`에 `ImageOff` 있음. Task 005의 `PackageOpen`·`SearchX`와 같은 방식으로 import
- `Badge`의 `className`은 `cn()`으로 합쳐져 `opacity-60`을 덧붙일 수 있다
- 개발 서버는 지금 꺼져 있다(`lsof` 결과 없음). 브라우저 확인 때 메인 대화가 `npm run dev`를 백그라운드로 켠다

## 결정 사항 (계획 단계에서 미리 정함)

1. **링크 분기 방식**: 안쪽 내용(이미지 영역 + 글자 영역)을 변수 `content`에 담고, `item.url !== ""`이면 `<a href target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">{content}</a>`, 아니면 `<div className="flex flex-col gap-2">{content}</div>`로 두 번 return 한다. `const Wrapper = item.url ? "a" : "div"` 방식은 `href`·`target` prop이 `div`에 가면 타입이 꼬여 피한다
2. **흐린 배지 방식**: 1차는 가장 단순한 `variant="secondary"` + `className="opacity-60"`(링크 없는 카드만). 배지 모양이 다른 카드와 같고 흐리기만 하므로 "같은 종류인데 눌리지 않는 카드"라는 의미가 가장 잘 전달된다. 브라우저에서 구분이 안 보이면 `variant="outline"` + `text-muted-foreground`로 바꾼다(메인 대화가 확인 뒤 결정)
3. **대체 그림**: 이미지 영역 `div`에 `flex items-center justify-center`를 더하고 `<ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />`만 가운데. 조건 `showFallback = item.imageUrl === "" || failed`
4. **`aria-label`(선택 사항)**: 넣지 않는다. `<a>` 안의 소품 이름 `<p>`가 링크 이름이 되고, 브라우저가 `target="_blank"`를 이미 알린다. 명세에 "선택"으로 적힌 것이라 최소로 간다
5. **hover 효과**: `<img>`에만 `transition group-hover:opacity-90`. 대체 그림 아이콘에는 붙이지 않는다(명세대로)

## 수정 순서

1. **구현 (developer 에이전트)**: 작업 파일과 이 계획 파일 경로를 넘겨 구현 단계 1~5를 맡긴다
   - `item-card.tsx`: `"use client"`, `useState`·`ImageOff` import, 깨진 이미지 상태, 대체 그림 분기, `content` 변수 + `<a>`/`<div>` 분기, 링크 없는 카드 배지 `opacity-60`, 맨 위 주석 현행화
   - 다른 파일은 건드리지 않음 (`wishlist-view.tsx`·`category-chips.tsx`·`item-grid.tsx`·`page.tsx`·`items.ts`·`mock-items.ts`·`src/components/ui/`)
   - `npm run lint` → `npm run build`, `/` `○` Revalidate 5m 유지 확인. 작업 파일 구현 단계 1~5 체크, 상태 `진행 중`
   - 브라우저 단계 6~9는 developer가 하지 않는다 (에이전트 규칙). 메인 대화가 한다
2. **브라우저 확인 (메인 대화)**: `npm run dev`를 백그라운드로 켜고 Claude in Chrome(없으면 Playwright MCP)으로 아래 검증 절 수행. 스크린샷 4장 저장
3. **흐린 배지 최종 결정**: 2단계에서 mock-7 배지가 다른 배지와 충분히 구분되면 `opacity-60` 유지, 아니면 developer에게 `variant="outline"` + `text-muted-foreground`로 바꾸게 하고 lint·build 재확인
4. **작업 파일 마무리**: 브라우저 체크박스, 단계 6~9 체크, 상태 `완료`, 변경 요약 작성
5. **계획 파일**: 이 파일을 `plans/2026-10-25-project-notion-cms-task-004-plan.md`로 옮기고 완료 상태 추가
6. **ROADMAP**: `development-planner`에게 "Task 004 완료로 바꿔줘" (Task 004 ✅, Phase 2 ✅, 다음 우선순위 Task 006). 커밋은 사용자가 `/ship` (src 변경이라 code-reviewer 필수)

## 검증

1. lint 경고 0 · build 통과 · 라우트 표 `○ /  Revalidate 5m` (developer 보고로 확인. `ƒ`로 바뀌면 멈춤). 완료 체크리스트 `npm run check-all` → `npm run build`도 돌린다 (다른 세션이 추가한 Stop hook `.claude/hooks/check-after-work.sh`가 `src/` 변경이 있으면 턴 끝에 같은 명령을 자동으로 돌리므로, 실패 메시지가 오면 이어서 고친다)
2. 브라우저 `/` (1280px):
   - mock-3(몬스테라 대형 화분)·mock-5(울 혼방 거실 러그): 회색 배경 + `ImageOff` 아이콘, 다른 카드 이미지와 같은 정사각형 (mock-5는 이미지 요청 실패 뒤 바뀌므로 1~2초 대기)
   - 콘솔에 "An empty string was passed to the src attribute" **없음**. mock-5의 404 네트워크 오류 1건은 정상
   - mock-8(빈티지 벽시계): "기타" 배지
   - mock-1(오크 원목 사이드 테이블): 요소가 `<a>`, `target="_blank"`·`rel="noopener noreferrer"` 확인(JS), hover 시 커서 손가락 + 이미지 살짝 흐려짐. 클릭 → 새 탭에 `https://example.com/products/oak-side-table`, 원래 탭 주소 `http://localhost:3000/` 유지
   - mock-7(월넛 책장): 요소가 `<div>`, `<a>` 없음, 배지 흐림, 클릭해도 탭·주소 변화 없음
   - 스크린샷 `.playwright-mcp/task-004-desktop.png`·`task-004-hover.png`·`task-004-no-link.png`
3. 375px·다크 모드: 2열에서 대체 그림이 정사각형, 흐린 배지·"기타" 배지가 읽힘, 다크에서 `bg-muted` 배경과 아이콘이 구분됨. 스크린샷 `.playwright-mcp/task-004-mobile.png`
4. `git status --short`·`git diff --stat`에서 `src/` 변경은 `item-card.tsx` **하나**. 문서(작업 파일·ROADMAP·계획)만 추가로 바뀜

## 주의: 다른 세션의 변경과 섞지 않기

작업 폴더에 이 Task와 무관한 변경이 이미 있다 — `.claude/settings.json` 수정, `.claude/hooks/check-after-work.sh`·`lint-changed-file.sh`(새), `plans/2026-10-25-project-notion-cms-auto-check-hooks-plan.md`(새). 다른 세션의 "자동 검사 hook" 작업으로 보인다. 이 Task에서는 손대지 않고, `/ship` 때 올릴 파일 목록에서 따로 표시해 포함 여부를 묻는다.

## 범위 밖

- `category-chips.tsx` 칩 포커스 링 잘림(code-reviewer 메모) — 브라우저 확인 중 눈에 띄면 보고만 하고 별도 수정으로 처리
- Notion 실제 데이터 연결(Task 006), 더미 데이터 삭제

## 완료 상태 (2026-10-25)

- ✅ 1단계: `developer` 에이전트가 `item-card.tsx` 구현. lint(경고 0)·build·check-all 통과, `/` `○` Revalidate 5m 유지
- ✅ 2단계: 브라우저 확인은 Claude in Chrome·Playwright MCP가 이 세션에 없어 npx 캐시의 `playwright-core` + 설치된 Google Chrome(headless)으로 스크립트를 돌려 수행. 검증 절 항목 전부 통과, 스크린샷 4장 저장
- ✅ 보완(계획에 없던 버그): 깨진 이미지 요청이 hydration보다 먼저 실패하면 `onError`가 울리지 않아 `<img>`가 남는 타이밍 버그 발견(3회 중 2회 재현). `<img>`에 ref 콜백 `markIfAlreadyFailed`(`complete && naturalWidth === 0`이면 `setFailed(true)`) 추가로 해결. 보완 후 6회 반복 모두 통과
- ✅ 3단계: 흐린 배지는 `opacity-60` 유지
- ✅ 4·5단계: 작업 파일 상태 `완료`·체크박스·변경 요약 보충, 계획 파일 이름 변경
- 6단계 ROADMAP 갱신은 development-planner, 커밋은 `/ship`

## 남은 작업

- 없음. 다음은 "Task 006 작업 파일 만들어줘" (Notion 소품을 Item으로 바꿔 화면에 연결)
