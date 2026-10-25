# Task 005: 종류 칩 필터와 빈 상태 만들기

담당 기능: F003, F004 · Phase 2 · 상태: 완료

> 순서 변경(2026-10-11 사용자 결정): 이 Task를 **Task 004(카드의 예외 상태)보다 먼저** 한다. 두 Task가 고치는 파일이 다르다 — Task 004는 `item-card.tsx`, 이 Task는 새 `category-chips.tsx`와 `wishlist-view.tsx`. 그래서 이 Task 중에는 `item-card.tsx`를 건드리지 않고, mock-3(이미지 없음)·mock-5(깨진 주소)·mock-7(링크 없음) 카드가 아직 대체 그림·링크 없이 보여도 정상이다.

## 목표

카드 그리드 위에 "전체" + 종류 칩(가구·조명·화분·…·기타)을 가로 한 줄로 두고, 칩을 누르면 그 종류의 카드만 보이게 한다. 필터는 **브라우저 안에서만** 동작해 주소가 바뀌지 않는다. 더불어 빈 상태 2종을 shadcn `Empty`로 그린다 — 소품이 0개면 칩을 숨기고 "아직 소품이 없어요", 칩을 눌렀는데 결과가 0개면 칩은 그대로 두고 "이 종류의 소품이 없어요". 이 Task가 끝나면 `/`에서 "목록 → 칩 → 해당 종류만 보기 → 전체 복귀"의 흐름을 눌러 볼 수 있다.

PRD 근거: F003 "상단에 '전체' + 종류 칩을 나열하고, 누르면 그 종류의 카드만 보인다. 브라우저 안에서만 동작하며 주소는 바뀌지 않는다 (주소 쿼리로 서버에서 거르면 … F010의 캐시가 무력화되기 때문). 칩 목록은 소품들의 종류 값에서 자동으로 만들어져 Notion에 종류를 추가해도 코드 수정이 없다", F004 "소품 0개 → '아직 소품이 없어요', 필터 결과 0개 → '이 종류의 소품이 없어요'", 사용자 여정 "[소품 0개] → 빈 상태 문구 … 표시 (종류 칩도 보이지 않음)", 페이지별 상세 "클릭 시 브라우저 안에서 즉시 필터하고 선택된 칩을 강조, 주소 변화 없음 (F003)". 가정 "종류 칩 목록 생성 방식: 가져온 소품들의 종류 값을 중복 제거 … 소품이 하나도 없는 종류는 칩에 나오지 않는다. … '기타' 칩은 맨 끝", "칩 순서: '전체'가 맨 앞, 그 뒤는 소품 목록에 처음 등장한 순서". F004의 나머지(대체 이미지·"기타" 배지 흐림)는 Task 004.

## 관련 파일

- 새로 만들 파일:
  - `src/components/features/wishlist/category-chips.tsx` (`CategoryChips` — "전체" + 종류 칩 한 줄. `"use client"`)
- 고칠 파일:
  - `src/components/features/wishlist/wishlist-view.tsx` (`"use client"` 추가, 선택 종류 `useState`, 칩 목록 계산, 필터링, 빈 상태 2종 분기. 맨 위 주석 "Task 005에서 종류 칩과 빈 상태가 들어간다"도 현행화)
  - `src/components/features/wishlist/item-grid.tsx` — **코드는 그대로**, 주석 한 줄("빈 배열일 때의 … Task 005에서 넣는다")만 "빈 상태는 `WishlistView`가 처리한다"로 고침
- 건드리지 않는 파일:
  - `src/components/features/wishlist/item-card.tsx` — Task 004 몫(대체 그림·`onError`·링크 `<a>`·"기타" 흐림). 이 Task에서 열지 않는다
  - `src/app/(marketing)/page.tsx` — 서버 컴포넌트 그대로. `revalidate = 300`과 `<WishlistView items={mockItems} />` 유지. `items`는 평범한 객체 배열이라 클라이언트 컴포넌트로 넘겨도 된다
  - `src/lib/items.ts`·`src/lib/mock-items.ts` — 타입·더미는 그대로 쓴다 (빈 상태 확인용 임시 변경은 아래 "검증 전용" 단계 참고. **코드로 남기지 않는다**)
- 참고할 기존 코드:
  - `src/lib/items.ts` — `Item` 타입, `OTHER_CATEGORY = "기타"`. "기타"를 맨 끝으로 보낼 때 문자열 `"기타"`를 직접 쓰지 말고 이 상수를 비교에 쓴다
  - `src/lib/mock-items.ts` — 더미 9개. 종류 등장 순서는 가구(mock-1) → 조명(mock-2) → 화분(mock-3) → 수납(mock-4) → 러그(mock-5) → 소품(mock-6) → (가구 중복, mock-7) → 기타(mock-8) → (조명 중복, mock-9). 따라서 칩은 `전체 · 가구 · 조명 · 화분 · 수납 · 러그 · 소품 · 기타` 순서가 나와야 한다. 더미는 모든 종류에 소품이 있으므로 "이 종류의 소품이 없어요"는 자연스럽게 나오지 않는다 (검증 전용 단계로 확인)
  - `src/components/features/wishlist/wishlist-view.tsx` — 지금은 `"use client"` 없이 `<ItemGrid items={items} />`만 그린다. prop 타입 `WishlistViewProps`(`items: Item[]`)는 유지
  - `src/components/features/wishlist/item-grid.tsx` — `ItemGrid`(`items: Item[]` → `ul.grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4`). 이 Task에서는 **거른 배열**을 넘긴다
  - `src/components/ui/button.tsx` — shadcn `Button`. `variant`: `default`(`bg-primary text-primary-foreground`)·`outline`(`border-border bg-background hover:bg-muted`) 등, `size="sm"`은 `h-7 px-2.5 text-[0.8rem] rounded-[min(var(--radius-md),12px)]`. 기본 클래스에 이미 `shrink-0`·`whitespace-nowrap`이 있고, `className`은 `cn()`(tailwind-merge)으로 합쳐지므로 `rounded-full`을 주면 `size="sm"`의 `rounded-[…]`를 덮어쓴다
  - `src/components/ui/empty.tsx` — shadcn `Empty` 조각: `Empty`(바깥 틀, `flex flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center`), `EmptyHeader`(아이콘+제목+설명 묶음), `EmptyMedia`(`variant="icon"`이면 `size-8 rounded-lg bg-muted` 아이콘 자리), `EmptyTitle`(`text-sm font-medium`), `EmptyDescription`(`text-sm text-muted-foreground`), `EmptyContent`(버튼 등 아래 내용 — 이 Task에서는 안 씀)
  - `lucide-react` — 빈 상태 아이콘. 예: 소품 0개 `PackageOpen`, 필터 결과 0개 `SearchX` (구현 때 다른 아이콘으로 바꿔도 됨)
  - `src/lib/utils.ts` — `cn()`
- 읽을 규칙:
  - `CLAUDE.md` "프로젝트 문서" — 자동 갱신은 `export const revalidate = 300`(ISR). **칩 필터가 주소(쿼리)를 바꾸면 이 캐시가 깨지므로 서버 필터·`useSearchParams`·`router.push`를 쓰지 않는다**
  - `CLAUDE.md` "구조" — 계층 `lib` → `components/ui` → `features/<기능>` → `app`. `features/wishlist/`는 `@/lib/*`·`@/components/ui/*`·같은 폴더 파일만 import. `<main>`은 틀이 그리므로 넣지 않음
  - `CLAUDE.md` "코드 규칙" — kebab-case 파일 이름, named export, `"use client"`는 상태·이벤트 핸들러가 필요한 파일에만(이 Task에서는 두 파일 모두 해당), 한국어 문구, 색은 토큰 클래스만(`bg-primary`·`bg-background`·`text-muted-foreground`·`bg-muted` 등), 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음), 주석 한국어, `any` 금지
  - `.claude/rules/library-docs.md` — shadcn 부품 사용법이 헷갈리면 `npx shadcn docs empty`·`npx shadcn docs button`. Tailwind `overflow-x-auto`·`shrink-0`·`rounded-full`은 `https://tailwindcss.com/docs/<주제>`
  - `docs/prd/prd.md` F003·F004 행, 사용자 여정 1~2번, 가정 "종류 칩 목록 생성 방식"·"칩 순서"

## 명세

- **`src/components/features/wishlist/category-chips.tsx`** — `CategoryChips` named export, 맨 위에 `"use client"` (칩 `onClick` 핸들러 때문)
  - prop: `categories: string[]`("전체"를 **뺀** 종류 목록, 이미 정렬된 상태로 받음) · `selected: string`(지금 선택된 값. "전체"면 `ALL_CATEGORY`) · `onSelect: (category: string) => void`
  - 상수 `export const ALL_CATEGORY = "전체"`를 이 파일에 둔다. "전체"는 Notion 종류 값이 아니라 화면 전용 라벨이므로 `src/lib/items.ts`의 `OTHER_CATEGORY`와 달리 화면 부품 쪽에 둔다. `WishlistView`가 import해서 초기값·비교에 쓴다
  - 그리는 것: `[ALL_CATEGORY, ...categories]`를 `Button`으로 나열. **"전체"가 맨 앞**(PRD 가정)
  - 칩 모양(2026-10-11 사용자 디자인 결정, 참고 디자인 반영): shadcn `Button` `size="sm"`, 선택된 칩은 `variant="default"`, 나머지는 `variant="outline"`. `className="rounded-full shrink-0"`로 **알약 모양**. 색 타일·개수 표시(예: "가구 2")는 **하지 않는다**
  - 배치: 바깥 `div`에 `flex gap-2 overflow-x-auto`로 **휴대폰에서 가로 스크롤 한 줄**. `flex-wrap`으로 줄바꿈하지 않는다. 칩에 `shrink-0`가 있어야 좁은 폭에서 찌그러지지 않고 넘친 만큼 스크롤된다. 틀의 좌우 여백 밖까지 스크롤 영역을 넓히고 싶으면 `-mx-4 px-4`처럼 음수 여백을 쓴다(선택 사항, 구현 때 판단)
  - 접근성: 선택된 칩에 `aria-pressed={true}`, 나머지 `aria-pressed={false}` (토글 버튼임을 스크린리더에 알림). 바깥 `div`에 `role="group"`과 `aria-label="종류 필터"`. `Button`은 `<button>`이라 키보드 Tab·Enter가 기본으로 된다
  - `key`는 종류 문자열(중복 제거된 뒤라 고유). 각 칩 `onClick={() => onSelect(category)}`
  - 문구 한국어("전체"), 색은 `Button` variant의 토큰만 쓰고 직접 색을 적지 않는다
- **`src/components/features/wishlist/wishlist-view.tsx`** 고치기 — 맨 위에 `"use client"` (`useState` 때문)
  - `const [selected, setSelected] = useState(ALL_CATEGORY)`. **주소는 절대 바꾸지 않는다** — `useSearchParams`·`useRouter().push/replace`·`<Link href="?…">` 금지(F003 명세, F010 캐시 보호). 새로 고침하면 "전체"로 돌아오는 것이 정상
  - **칩 목록 계산**(PRD 가정 그대로): `items`를 순서대로 돌며 `category`를 **등장 순서대로 중복 제거**하고(예: `Set` 또는 `includes` 검사), 그중 `OTHER_CATEGORY`("기타")가 있으면 빼서 **맨 끝에 붙인다**. "전체"는 여기 넣지 않는다(`CategoryChips`가 붙임). 소품이 없는 종류는 자연히 칩에 안 나온다. 작은 배열이라 `useMemo`는 없어도 된다
  - **필터링**: `selected === ALL_CATEGORY`면 `items` 전체, 아니면 `items.filter((item) => item.category === selected)`
  - **빈 상태 1 — 소품 0개(F004)**: `items.length === 0`이면 **칩을 그리지 않고** `Empty`만 그린다. `EmptyHeader` > `EmptyMedia variant="icon"`(아이콘) + `EmptyTitle` **"아직 소품이 없어요"** + `EmptyDescription`(예: "Notion 표에 소품을 추가하면 여기에 나타나요"). 사용자 여정대로 리디렉션 없음
  - **빈 상태 2 — 필터 결과 0개(F004)**: `items.length > 0`이지만 거른 결과가 0개면 **칩은 그대로 두고** 그리드 자리에 `Empty`: `EmptyTitle` **"이 종류의 소품이 없어요"** + `EmptyDescription`(예: "다른 종류를 눌러 보세요"). 칩이 남아 있어야 "전체"나 다른 칩을 눌러 복귀할 수 있다 (실제 데이터에서는 칩이 소품에서 만들어지므로 거의 안 보이지만, PRD F004 명세이므로 구현한다)
  - **정상**: `<div className="flex flex-col gap-6">` 안에 `<CategoryChips categories={…} selected={selected} onSelect={setSelected} />` + `<ItemGrid items={filtered} />`. 칩은 그리드 위, `PageHeader` 아래에 온다(`page.tsx`는 안 고침)
  - 빈 상태 문구는 한국어, 아이콘·글자색은 `Empty` 조각의 토큰(`bg-muted`·`text-muted-foreground`)을 그대로 쓴다. 두 빈 상태의 문구만 다르므로 `Empty` 묶음을 작은 내부 함수로 한 번만 적어도 된다(파일을 늘리지 않으려면 `wishlist-view.tsx` 안에)
- **`src/components/features/wishlist/item-grid.tsx`** — 주석 한 줄만 현행화. 코드 변경 없음
- **공통**: 파일 이름 kebab-case, named export, 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음), 주석 한국어, `any` 금지. `features/wishlist/`는 `@/lib/*`·`@/components/ui/*`·같은 폴더 파일만 import. `wishlist-view.tsx`가 클라이언트 컴포넌트가 되면 거기서 import하는 `ItemGrid`·`ItemCard`도 브라우저 번들에 들어가는데, 둘 다 서버 전용 코드가 없으므로 문제없다(Task 004에서 `item-card.tsx`에 `"use client"`를 붙이는 것과도 충돌 없음)

## 구현 단계

- [x] 1. `src/components/features/wishlist/category-chips.tsx` 만들기 — `"use client"`, `ALL_CATEGORY = "전체"` export, `categories`·`selected`·`onSelect` prop, `div.flex.gap-2.overflow-x-auto`(`role="group"`, `aria-label="종류 필터"`) 안에 `[ALL_CATEGORY, ...categories]`를 `Button size="sm" className="rounded-full shrink-0"`로 나열. 선택은 `variant="default"` + `aria-pressed`, 나머지 `variant="outline"`
- [x] 2. `src/components/features/wishlist/wishlist-view.tsx` 고치기 — `"use client"`, `useState(ALL_CATEGORY)`, 칩 목록 계산(등장 순서 중복 제거 + `OTHER_CATEGORY` 맨 끝), 필터링, 빈 상태 2종(`Empty`·`EmptyHeader`·`EmptyMedia variant="icon"`·`EmptyTitle`·`EmptyDescription`), 정상 화면(`CategoryChips` + `ItemGrid items={filtered}`). 맨 위 주석 현행화. `useSearchParams`·`router` import 없음
- [x] 3. `src/components/features/wishlist/item-grid.tsx` 주석 한 줄 현행화 (코드 변경 없음)
- [x] 4. `npm run lint` → `npm run build` (build 라우트 표에서 `/`가 여전히 Revalidate 5m인지 확인 — 칩이 주소를 안 바꾸므로 ISR이 유지돼야 한다. `ƒ`(동적)로 바뀌면 `useSearchParams` 같은 것이 섞인 것)
- [x] 5. 브라우저 확인(정상 흐름) — `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 dev 서버 확인 후 `/` 열기. 칩 순서 `전체 · 가구 · 조명 · 화분 · 수납 · 러그 · 소품 · 기타`, "가구" 클릭 → mock-1·mock-7 2장만, 주소창 그대로, "전체" 클릭 → 9장 복귀, 선택 칩만 채워진 색(`default`). 375px 폭에서 칩이 한 줄로 가로 스크롤(줄바꿈 없음). 스크린샷 `.playwright-mcp/task-005-desktop.png`·`task-005-mobile.png`
- [x] 6. **검증 전용 — 소품 0개 빈 상태**: `src/app/(marketing)/page.tsx`의 `items={mockItems}`를 **잠시** `items={[]}`로 바꿔 `/`에 칩 없이 "아직 소품이 없어요"만 보이는지 확인(스크린샷 `.playwright-mcp/task-005-empty-all.png`), 바로 되돌린다
- [x] 7. **검증 전용 — 필터 결과 0개 빈 상태**: `wishlist-view.tsx`의 칩 목록 계산 결과에 **잠시** 소품이 없는 종류 하나(예: `"거울"`)를 끼워 넣어 그 칩을 누르면 칩은 남고 "이 종류의 소품이 없어요"가 보이는지 확인(스크린샷 `.playwright-mcp/task-005-empty-filter.png`), 바로 되돌린다
- [x] 8. 되돌림 확인 — `git status`·`git diff`로 `page.tsx`·`mock-items.ts`·`items.ts`·`item-card.tsx`에 변경이 없고, `wishlist-view.tsx`에 임시 종류가 남아 있지 않은지 본다. 6·7의 임시 변경은 **커밋에 포함하지 않는다**

## 완료 기준

- [x] `npm run lint` 통과
- [x] `npm run build` 통과 (라우트 표에서 `/` Revalidate 5m 유지 — 주소 쿼리를 쓰지 않아 ISR이 깨지지 않았다는 뜻)
- [x] 브라우저 확인: 칩이 `PageHeader` 아래·그리드 위에 `전체 · 가구 · 조명 · 화분 · 수납 · 러그 · 소품 · 기타` 순서로 보이고, **"기타"가 맨 끝**, "전체"가 맨 앞. 처음에는 "전체"가 선택돼 9장 전부 보임
- [x] 브라우저 확인: "가구" 클릭 → 가구 카드(mock-1·mock-7)만 보이고 **주소창이 바뀌지 않음**(쿼리·해시 없음, 페이지 새로 고침 없음). "조명" 클릭 → mock-2·mock-9만. "기타" 클릭 → mock-8만
- [x] 브라우저 확인: "전체" 클릭 시 9장 전부로 복귀. 선택된 칩만 `variant="default"`(채워진 색)로 강조되고 나머지는 `outline`, 선택 칩에 `aria-pressed="true"`
- [x] 브라우저 확인: 휴대폰 폭(375px)에서 칩이 **가로 스크롤 한 줄**(세로로 줄바꿈되지 않고, 옆으로 밀어 "기타"까지 닿음). 데스크톱 폭(1280px)에서는 한 줄에 다 들어감. 칩은 알약 모양(`rounded-full`)
- [x] 브라우저 확인(검증 전용): 소품 0개 → 칩이 보이지 않고 "아직 소품이 없어요"만 보임. 필터 결과 0개 → 칩은 그대로 있고 "이 종류의 소품이 없어요"가 보이며 "전체"를 누르면 복귀
- [x] `src/app/(marketing)/page.tsx`·`src/lib/items.ts`·`src/lib/mock-items.ts`·`src/components/features/wishlist/item-card.tsx`에 변경 없음(검증용 임시 변경 모두 되돌림). `wishlist-view.tsx`·`category-chips.tsx`에 `useSearchParams`·`useRouter` 없음

## 변경 요약

- 새로 만든 파일: `src/components/features/wishlist/category-chips.tsx` — `CategoryChips`(`"use client"`, `ALL_CATEGORY = "전체"` export, prop `categories`·`selected`·`onSelect`). `div.flex.gap-2.overflow-x-auto`(`role="group"`, `aria-label="종류 필터"`) 안에 `[ALL_CATEGORY, ...categories]`를 `Button size="sm" className="shrink-0 rounded-full"`로 나열. 선택 칩은 `variant="default"` + `aria-pressed={true}`, 나머지 `outline` + `aria-pressed={false}`. `type="button"` 명시
- 고친 파일: `src/components/features/wishlist/wishlist-view.tsx` — `"use client"`, `useState(ALL_CATEGORY)`, 칩 목록 계산 함수 `getCategories()`(등장 순서 중복 제거 + `OTHER_CATEGORY` 맨 끝), 필터링, 빈 상태 2종(내부 `EmptyState` 함수로 `Empty`·`EmptyHeader`·`EmptyMedia variant="icon"`·`EmptyTitle`·`EmptyDescription` 한 번만 적음), 정상 화면 `div.flex.flex-col.gap-6` 안에 `CategoryChips` + `ItemGrid items={filtered}`. 맨 위 주석 현행화. `src/components/features/wishlist/item-grid.tsx` — 주석 한 줄만 "빈 상태는 WishlistView가 처리한다"로 현행화 (코드 변경 없음)
- 결정 사항: 빈 상태 아이콘은 작업 파일 예시대로 소품 0개 `PackageOpen`, 필터 결과 0개 `SearchX`(`lucide-react` d.ts에서 이름 확인). 설명 문구는 예시 그대로 "Notion 표에 소품을 추가하면 여기에 나타나요"·"다른 종류를 눌러 보세요". 칩 바깥 `div`의 음수 여백(`-mx-4 px-4`)은 선택 사항이라 넣지 않음(틀 여백 안에서 스크롤). `useMemo` 없음(작은 배열). `useSearchParams`·`useRouter`·`<Link href="?…">` 없음
- 확인: lint 통과(경고 0), build 통과, 라우트 표에서 `/` `○` 정적 + Revalidate 5m 유지. `page.tsx`·`items.ts`·`mock-items.ts`·`item-card.tsx`·`src/components/ui/` 변경 없음
- 브라우저 확인 결과(Claude in Chrome, dev 서버): 칩 순서 `전체·가구·조명·화분·수납·러그·소품·기타`, 처음 "전체" 선택·9장. "가구" 2장(오크 원목 사이드 테이블·월넛 책장), "조명" 2장, "기타" 1장(빈티지 벽시계), 모두 주소 `http://localhost:3000/` 그대로. "전체" 복귀 9장, 선택 칩만 `aria-pressed="true"`, 칩 `border-radius` 사실상 무한(알약). 375px(iframe): 칩 한 줄(`offsetTop` 1종), `scrollWidth` 409 > `clientWidth` 343으로 가로 스크롤, 그리드 2열. 검증 전용: `page.tsx`에 `items={[]}` → 칩 0개·"아직 소품이 없어요"; `wishlist-view.tsx`에 "거울" 임시 추가 → 클릭 시 칩 9개 유지·"이 종류의 소품이 없어요", "전체"로 9장 복귀. 둘 다 즉시 원복(`git diff` 없음 확인). 스크린샷 `.playwright-mcp/task-005-desktop.png`·`-desktop-filtered.png`·`-mobile.png`·`-empty-all.png`·`-empty-filter.png`
- 남긴 일: 대체 그림·`onError`·링크 `<a>`·"기타" 배지 흐림은 Task 004. 검증 전용 단계 6·7(임시 `items={[]}`·임시 종류 추가)은 메인 대화가 수행 후 원복
