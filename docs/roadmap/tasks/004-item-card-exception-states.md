# Task 004: 카드의 예외 상태 만들기

담당 기능: F002, F004 · Phase 2 · 상태: 완료

> 순서 메모: Task 005(종류 칩 필터·빈 상태)가 2026-10-11에 먼저 완료되어 `main`에 병합됐다(PR #21). 그래서 이 Task는 Phase 2의 **마지막** Task이며, 고치는 파일은 `src/components/features/wishlist/item-card.tsx` **하나**다. `wishlist-view.tsx`·`category-chips.tsx`·`item-grid.tsx`·`page.tsx`·`items.ts`·`mock-items.ts`는 건드리지 않는다.

## 목표

소품 카드가 "이상한 데이터"를 받아도 화면이 깨지지 않게 한다. 이미지 URL이 비었거나 주소가 깨지면 이미지 자리에 회색 배경 + 아이콘 **대체 그림**을 같은 크기로 그리고(F004), 상품 링크가 있으면 카드 전체가 **새 탭**으로 열리는 링크가 되며, 링크가 없으면 눌러도 아무 일이 없는 "보이기만 하는 카드"로 구분해 그린다(F002). 종류가 비어 `"기타"`로 들어온 소품은 "기타" 배지로 그대로 보인다(F004). 이 Task가 끝나면 Phase 2(화면)가 끝나고, 더미 데이터 9장으로 PRD의 모든 카드 상태를 눌러 볼 수 있다.

PRD 근거: F002 "카드를 누르면 Notion의 '상품 링크'가 새 탭으로 열린다 (`target="_blank"`에 `rel="noopener noreferrer"`를 함께 둬 새 탭이 원래 탭을 조작하지 못하게 한다). 링크가 비어 있으면 눌러도 이동하지 않는다", F004 "이미지 URL이 비었거나 깨지면 회색 배경 + 아이콘 대체 그림. 종류가 비어 있으면 '기타' 배지", 사용자 여정 3번 "[상품 링크 있음] → 쇼핑몰 상품 페이지가 새 탭으로 열림 (현재 탭은 목록 유지) / [상품 링크 없음] → 아무 일도 일어나지 않음 (카드는 보이기만 함)". 가정 "카드 이미지 크기: … 비었거나 깨졌을 때의 대체 그림도 같은 크기로 그린다", "링크 없는 카드 모양: 상품 링크가 빈 카드는 눌리지 않는 모양(기본 커서, 흐린 배지)으로 구분해, 눌러도 아무 일이 없는 이유를 알 수 있게 한다". F004의 빈 상태 2종은 Task 005에서 끝났다.

## 관련 파일

- 새로 만들 파일: 없음
- 고칠 파일:
  - `src/components/features/wishlist/item-card.tsx` (`ItemCard` — `"use client"` 추가, 대체 그림 분기, 링크 `<a>`/`<div>` 분기, 링크 없는 카드 흐림. 맨 위 주석 "…Task 004에서 덧붙인다"도 현행화)
- 건드리지 않는 파일:
  - `src/components/features/wishlist/wishlist-view.tsx`·`category-chips.tsx` — Task 005 산출물. 칩·필터·빈 상태는 이미 끝났다
  - `src/components/features/wishlist/item-grid.tsx` — `ul > li > ItemCard` 구조 그대로. 카드가 `<a>`로 바뀌어도 `li` 안에 들어가므로 손댈 것이 없다
  - `src/app/(marketing)/page.tsx` — 서버 컴포넌트, `revalidate = 300`, `<WishlistView items={mockItems} />` 유지
  - `src/lib/items.ts`·`src/lib/mock-items.ts` — 타입·더미 그대로. 더미에 예외 4종이 이미 있어 이 Task에서는 **임시 변경조차 필요 없다**
- 참고할 기존 코드:
  - `src/components/features/wishlist/item-card.tsx` 현재 모습(Task 003) — `div.flex.flex-col.gap-2` > 이미지 영역 `div.aspect-square.w-full.overflow-hidden.rounded-2xl.bg-muted` > `<img src={item.imageUrl} alt={item.name} className="size-full object-cover" loading="lazy" />`(위에 `eslint-disable-next-line @next/next/no-img-element` 주석) + 글자 영역 `div.flex.flex-col.gap-1.px-0.5` > `p.line-clamp-2.text-sm.font-semibold`(이름) + `Badge variant="secondary"`(종류). `"use client"` 없음. 이 구조와 클래스는 유지하고 분기만 덧붙인다
  - `src/lib/items.ts` — `Item`(`id`·`name`·`url`·`imageUrl`·`category`, 모두 `string`, 없는 값은 `""`), `OTHER_CATEGORY = "기타"`. `category`는 비어 있지 않게 보장되므로 카드는 **`item.category`를 그대로** 배지에 넣으면 "기타"가 나온다. `OTHER_CATEGORY` 비교 분기는 필요 없다
  - `src/lib/mock-items.ts` — 더미 9개 중 예외 4종: **mock-3** "몬스테라 대형 화분"(`imageUrl: ""`, 이미지 없음) · **mock-5** "울 혼방 거실 러그"(`imageUrl: "https://example.com/missing/wool-rug.jpg"`, 깨진 주소 → `onError`) · **mock-7** "월넛 책장"(`url: ""`, 링크 없음) · **mock-8** "빈티지 벽시계"(`category: OTHER_CATEGORY`, "기타" 배지). 나머지 5개(mock-1·2·4·6·9)는 `https://example.com/products/...` 링크와 `picsum.photos` 이미지가 있는 정상 카드
  - `src/components/ui/badge.tsx` — shadcn `Badge`(`span`, `variant="secondary"`는 `bg-secondary text-secondary-foreground`). `className`은 `cn()`으로 합쳐지므로 흐림 클래스(`opacity-60` 등)를 덧붙일 수 있다
  - `lucide-react` — `ImageOff` 아이콘(`node_modules/lucide-react/dist/lucide-react.d.ts`에 `declare const ImageOff: LucideIcon` 있음 확인). Task 005에서 `PackageOpen`·`SearchX`를 같은 방식으로 import했다(`import { ImageOff } from "lucide-react"`)
  - `src/components/features/wishlist/category-chips.tsx`·`wishlist-view.tsx` — `"use client"` + `useState`를 붙인 파일 예시
  - `src/lib/utils.ts` — `cn()` (조건부 클래스 합치기에 쓸 수 있음)
- 읽을 규칙:
  - `CLAUDE.md` "프로젝트 문서" — 외부 이미지는 `next/image` 대신 일반 `<img>` (`@next/next/no-img-element`는 해당 줄 eslint 주석으로 처리, 설정 파일은 손대지 않음)
  - `CLAUDE.md` "구조" — 계층 `lib` → `components/ui` → `features/<기능>` → `app`. `item-card.tsx`는 `@/lib/*`·`@/components/ui/*`·`lucide-react`·`react`만 import
  - `CLAUDE.md` "코드 규칙" — `"use client"`는 상태·이벤트 핸들러가 필요한 파일에만(이 파일은 `onError`·`useState` 때문에 해당), named export, 한국어 문구·주석, 색은 토큰 클래스만(`bg-muted`·`text-muted-foreground` 등. 회색을 직접 `#999`나 `gray-400`으로 적지 않는다), 기존 파일 방식(큰따옴표, 세미콜론 없음) 유지, `any` 금지
  - `.claude/rules/library-docs.md` — Tailwind `group`·`group-hover`·`opacity`·`transition`이 헷갈리면 `https://tailwindcss.com/docs/hover-focus-and-other-states` 등. Next.js 클라이언트 컴포넌트 규칙은 `node_modules/next/dist/docs/`
  - `docs/prd/prd.md` F002·F004 행, 사용자 여정 3번, 가정 "카드 이미지 크기"·"링크 없는 카드 모양"

## 명세

- **`"use client"` 추가** — 파일 맨 위. 이유: 이미지가 깨졌는지는 브라우저가 이미지를 실제로 받아 봐야 알 수 있고, 그 신호가 `<img>`의 `onError` 이벤트다. 이벤트 핸들러와 그 결과를 담는 `useState`는 서버 컴포넌트에서 쓸 수 없다. `wishlist-view.tsx`가 이미 클라이언트 컴포넌트라 `ItemCard`는 이미 브라우저 번들에 들어가 있으므로 성능·구조 변화는 없다
- **깨진 이미지 상태(`useState`)** — `const [failed, setFailed] = useState(false)` 같은 불리언 하나. `<img onError={() => setFailed(true)} />`. 한 번 실패하면 되돌리지 않는다(같은 주소를 다시 시도할 이유가 없음). 상태 이름은 구현 때 정해도 된다
- **대체 그림 분기(F004)** — `const showFallback = item.imageUrl === "" || failed` 조건이 참이면 이미지 영역 `div`(`aspect-square w-full overflow-hidden rounded-2xl bg-muted`, 크기·모서리 그대로) 안에 `<img>` 대신 **`ImageOff` 아이콘만 가운데** 둔다: 예) 영역 `div`에 `flex items-center justify-center`를 더하고 `<ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />`. 회색 배경은 이미 있는 `bg-muted` 토큰이 맡는다. PRD 가정대로 **이미지와 같은 크기**(정사각형)여야 한다
  - `imageUrl`이 빈 문자열이면 **`<img>`를 아예 그리지 않는다.** Task 003 상태에서는 mock-3가 `<img src="">`로 그려져 React가 콘솔에 "An empty string was passed to the src attribute" 오류를 찍는다. 이 분기로 그 오류가 사라져야 한다
  - 대체 그림에는 `alt`를 줄 `<img>`가 없으므로, 소품 이름은 아래 `<p>`가 이미 보여 준다. 아이콘은 장식이라 `aria-hidden`
- **정상 이미지** — 분기가 거짓이면 기존 `<img src={item.imageUrl} alt={item.name} className="size-full object-cover" loading="lazy" onError={…} />`를 그대로 둔다(`eslint-disable-next-line @next/next/no-img-element` 주석 유지, `next/image` 사용 안 함)
- **링크 처리(F002)** — `item.url !== ""`이면 카드 바깥 요소를 `<a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">`로, 비어 있으면 지금처럼 `<div className="flex flex-col gap-2">`로 그린다. 조건부로 태그만 바꾸고 **안쪽 내용(이미지 영역 + 글자 영역)은 한 번만 적는다**(예: 안쪽을 변수 `content`에 담아 두 분기에서 공유, 또는 `const Wrapper = item.url ? "a" : "div"` 식). `rel="noopener noreferrer"`는 PRD 명세 — 새 탭이 `window.opener`로 원래 탭을 조작하지 못하게 막는다. 카드 전체가 링크이므로 `<a>` 안에 다른 링크·버튼을 두지 않는다
- **링크 있는 카드의 눌리는 느낌** — `<a>`에 `group`을 주고 이미지(`<img>`)에 `transition group-hover:opacity-90`을 붙여, 마우스를 올리면 이미지가 살짝 흐려진다. 대체 그림(아이콘) 쪽에는 굳이 붙이지 않아도 된다. 브라우저 기본 `cursor: pointer`는 `<a href>`에 자동으로 붙는다
- **링크 없는 카드 모양(PRD 가정)** — `<div>`라서 커서는 기본(화살표)이고 클릭해도 아무 일이 없다. 추가로 **배지를 흐리게** 해 "눌리지 않는 카드"임을 구분한다: `Badge`에 `className="opacity-60"` 또는 `variant="outline"` + `text-muted-foreground` 등 토큰 기반 흐림. 이름 글자는 흐리지 않는다(읽어야 하는 정보). 어떤 방식을 쓸지는 구현 때 둘 다 띄워 보고 정하되, 색을 직접 적지 않는다
- **"기타" 배지(F004)** — 데이터가 이미 `OTHER_CATEGORY`("기타")로 들어오므로(Task 001 결정, Task 006의 Notion 매핑도 같은 규칙) `<Badge>{item.category}</Badge>`를 그대로 두면 끝. 카드 안에서 `OTHER_CATEGORY`를 비교하거나 특별 처리하지 않는다. 확인용 더미는 mock-8
- **접근성 메모** — `<a>` 안 전체가 링크 텍스트가 되므로 소품 이름 `<p>`가 링크의 이름이 된다. 새 탭으로 열리는 것을 스크린리더에 알리고 싶으면 `aria-label={`${item.name} (새 탭에서 열기)`}`를 `<a>`에 줄 수 있다(선택 사항). 키보드 Tab으로 `<a>`에 포커스가 가고 Enter로 열린다. 링크 없는 `<div>`는 포커스되지 않는 것이 맞다(누를 것이 없으므로)
- **공통** — 파일은 기존 방식(큰따옴표, 세미콜론 없음, 주석 한국어) 유지. `features/wishlist/`는 `@/lib/*`·`@/components/ui/*`·외부 라이브러리만 import. 맨 위 주석의 "Task 004에서 덧붙인다"를 현행 설명(대체 그림·새 탭 링크·링크 없는 카드 흐림을 담당)으로 바꾼다

## 구현 단계

- [x] 1. `src/components/features/wishlist/item-card.tsx` 맨 위에 `"use client"` 추가, `useState`(`react`)와 `ImageOff`(`lucide-react`) import. 맨 위 설명 주석 현행화
- [x] 2. 깨진 이미지 상태 `useState(false)`와 `showFallback = item.imageUrl === "" || failed` 조건 만들기. 이미지 영역 `div`(`aspect-square w-full overflow-hidden rounded-2xl bg-muted`)에서 조건이 참이면 `ImageOff` 아이콘(`text-muted-foreground`, `aria-hidden`)만 가운데(`flex items-center justify-center`), 거짓이면 기존 `<img>`(`onError={() => setFailed(true)}` 추가, `eslint-disable-next-line` 주석 유지)
- [x] 3. 링크 분기 — `item.url`이 있으면 바깥을 `<a href target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">`, 없으면 `<div className="flex flex-col gap-2">`. 안쪽 내용은 한 번만 적어 두 분기에서 공유. `<img>`에 `transition group-hover:opacity-90` 추가
- [x] 4. 링크 없는 카드의 `Badge`를 흐리게(`opacity-60` 또는 `variant="outline"` + `text-muted-foreground`, 토큰만). 링크 있는 카드의 `Badge`는 `variant="secondary"` 그대로. `{item.category}`는 그대로 두어 "기타"가 자연히 나오는지 확인
- [x] 5. `npm run lint` → `npm run build` (build 라우트 표에서 `/`가 여전히 `○` Revalidate 5m인지 확인 — 카드가 클라이언트 컴포넌트가 돼도 `page.tsx`가 서버 컴포넌트라 ISR은 유지돼야 한다)
- [x] 6. 브라우저 확인(데스크톱 1280px) — `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 dev 서버 확인 후 `/` 열기. mock-3(몬스테라 대형 화분)·mock-5(울 혼방 거실 러그) 카드에 회색 배경 + `ImageOff` 아이콘이 다른 카드 이미지와 같은 크기로 보이는지(mock-5는 이미지 요청이 실패한 뒤 바뀌므로 1~2초 기다림), mock-8(빈티지 벽시계)에 "기타" 배지. 콘솔(개발자 도구)에 "An empty string was passed to the src attribute" 오류가 **없는지**. 스크린샷 `.playwright-mcp/task-004-desktop.png`
- [x] 7. 브라우저 확인(링크) — mock-1(오크 원목 사이드 테이블) 카드에 마우스를 올리면 커서가 손가락, 이미지가 살짝 흐려짐. 클릭 → `https://example.com/products/oak-side-table`이 **새 탭**으로 열리고 원래 탭은 `http://localhost:3000/` 목록 그대로. 개발자 도구에서 `<a>`에 `target="_blank"`·`rel="noopener noreferrer"`가 있는지. mock-7(월넛 책장)은 커서가 기본 화살표, 배지가 흐리고, 클릭해도 아무 일 없음(주소·탭 변화 없음), 요소가 `<div>`. 스크린샷 `.playwright-mcp/task-004-hover.png`(mock-1 hover) · `.playwright-mcp/task-004-no-link.png`(mock-7 확대)
- [x] 8. 브라우저 확인(휴대폰 375px, 다크 모드) — 2열에서도 대체 그림이 정사각형이고 흐린 배지·"기타" 배지가 읽히는지. 다크 모드에서 `bg-muted` 배경과 `text-muted-foreground` 아이콘이 구분되는지. 스크린샷 `.playwright-mcp/task-004-mobile.png`
- [x] 9. `git status`·`git diff --stat`으로 변경 파일이 `src/components/features/wishlist/item-card.tsx` **하나**인지 확인 (`wishlist-view.tsx`·`category-chips.tsx`·`item-grid.tsx`·`page.tsx`·`items.ts`·`mock-items.ts` 변경 없음)

## 완료 기준

- [x] `npm run lint` 통과 (경고 0. `@next/next/no-img-element`는 해당 줄 주석으로 처리되어 있음)
- [x] `npm run build` 통과 (라우트 표에서 `/` `○` Revalidate 5m 유지)
- [x] 브라우저 확인: mock-3(이미지 URL 빈 문자열)·mock-5(깨진 주소) 카드에 **회색(`bg-muted`) 배경 + `ImageOff` 아이콘** 대체 그림이 다른 카드 이미지와 같은 정사각형 크기로 보임. 나머지 7장은 정상 이미지
- [x] 브라우저 확인: 콘솔에 "An empty string was passed to the src attribute" 오류가 **없음** (mock-3에 `<img>`가 그려지지 않음). mock-5의 이미지 404 네트워크 오류 1건은 깨진 주소 확인용이므로 정상
- [x] 브라우저 확인: mock-8(빈티지 벽시계)에 **"기타"** 배지
- [x] 브라우저 확인: 링크 있는 카드(예: mock-1)는 `<a href target="_blank" rel="noopener noreferrer">`, hover 시 이미지가 살짝 흐려지고(`group-hover:opacity-90`) 커서가 손가락. 클릭하면 **새 탭**이 열리고 **원래 탭은 목록을 유지**(주소 `http://localhost:3000/` 그대로)
- [x] 브라우저 확인: 링크 없는 카드(mock-7 월넛 책장)는 `<div>`로 그려져 커서가 기본 화살표, **배지가 흐림**, 클릭해도 아무 일 없음(새 탭·주소 변화 없음)
- [x] 브라우저 확인: 375px 2열과 다크 모드에서도 위 상태가 깨지지 않음. 스크린샷 `.playwright-mcp/task-004-desktop.png`·`task-004-hover.png`·`task-004-no-link.png`·`task-004-mobile.png`
- [x] 변경 파일이 `src/components/features/wishlist/item-card.tsx` 하나임 — `wishlist-view.tsx`·`category-chips.tsx`·`item-grid.tsx`·`src/app/(marketing)/page.tsx`·`src/lib/items.ts`·`src/lib/mock-items.ts`·`src/components/ui/` 변경 없음

## 범위 밖 메모

- code-reviewer가 Task 005 리뷰에서 남긴 "`category-chips.tsx`의 `overflow-x-auto` 때문에 칩의 키보드 포커스 링이 위아래로 잘릴 수 있음(추정)"은 **이 Task 범위 밖**이다. 이 Task의 브라우저 확인 중 Tab 키로 칩을 지나갈 때 눈에 띄면, `item-card.tsx` 커밋에 섞지 않고 별도의 작은 수정(예: 칩 바깥 `div`에 `py-1` 여백)으로 처리한다

## 변경 요약

- 고친 파일: `src/components/features/wishlist/item-card.tsx` 하나 — 맨 위 `"use client"`, `useState`(`react`)·`ImageOff`(`lucide-react`) import. `const [failed, setFailed] = useState(false)`, `showFallback = item.imageUrl === "" || failed`, `hasLink = item.url !== ""`. 안쪽 내용(이미지 영역 + 글자 영역)을 변수 `content`(Fragment)에 한 번만 적고, `hasLink`면 `<a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">{content}</a>`, 아니면 `<div className="flex flex-col gap-2">{content}</div>`로 두 번 return. 대체 그림은 이미지 영역 `div`(`aspect-square w-full overflow-hidden rounded-2xl bg-muted`)에 `flex items-center justify-center`를 더하고 `<ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />`만 가운데 — `imageUrl`이 비면 `<img>`를 아예 그리지 않는다. 정상 `<img>`에는 `onError={() => setFailed(true)}`와 `transition group-hover:opacity-90` 추가, `eslint-disable-next-line @next/next/no-img-element` 주석 유지. 링크 없는 카드만 `Badge variant="secondary" className="opacity-60"`, 링크 있는 카드는 `variant="secondary"` 그대로. `{item.category}`는 그대로 두어 "기타"가 자연히 나온다. 맨 위 주석을 현행 설명(대체 그림·새 탭 링크·링크 없는 카드 흐림·"기타" 배지)으로 바꿈
- 결정 사항(계획 파일 `plans/2026-10-25-project-notion-cms-task-004-plan.md`대로): 링크 분기는 `content` 변수 + 두 번 return(`Wrapper = item.url ? "a" : "div"` 방식은 `href`·`target` prop 타입이 꼬여 피함). 흐린 배지 1차는 `opacity-60`(브라우저에서 구분이 안 보이면 `variant="outline"` + `text-muted-foreground`로 바꾼다 — 메인 대화가 확인 뒤 결정). `aria-label`(선택 사항)은 넣지 않음. hover 효과는 `<img>`에만, 대체 그림 아이콘에는 붙이지 않음. `OTHER_CATEGORY` 비교 분기 없음. `cn()`은 쓰지 않고 `className={hasLink ? undefined : "opacity-60"}`로 처리(조건이 하나라 충분)
- 보완(브라우저 확인에서 찾은 버그): mock-5의 깨진 이미지 요청이 약 80ms 만에 실패(`net::ERR_BLOCKED_BY_ORB`)해 React hydration(서버 HTML에 이벤트 핸들러를 붙이는 과정)보다 먼저 끝나면 `onError`가 울리지 않아 `<img>`가 그대로 남는 타이밍 버그(`img.complete === true && img.naturalWidth === 0`)가 반복 재현됨. 실제 Notion 데이터의 DNS 오류 주소 등에서도 같은 문제가 나므로, `next/image`가 hydration 전 오류를 되살리는 것과 같은 목적으로(다만 재요청 없이 `complete`·`naturalWidth`를 읽기만 하는 더 단순한 방식) `<img>`에 ref 콜백 `markIfAlreadyFailed`를 달아 요소가 붙을 때 이미 깨져 있으면(`complete && naturalWidth === 0`) `setFailed(true)`를 호출. `useEffect`는 쓰지 않음(ref 콜백이 더 단순). lazy 이미지는 요청 전이라 `complete`가 false여서 오탐 없음
- 확인: `npm run lint` 통과(경고 0), `npm run build` 통과, 라우트 표에서 `/` `○` 정적 + Revalidate 5m 유지(카드가 클라이언트 컴포넌트가 돼도 `page.tsx`가 서버 컴포넌트라 ISR 유지). `npm run check-all`(lint + typegen + tsc) 통과. `git diff --stat`에서 `src/` 변경은 `item-card.tsx` 하나(63+ / 15-). `wishlist-view.tsx`·`category-chips.tsx`·`item-grid.tsx`·`page.tsx`·`items.ts`·`mock-items.ts`·`src/components/ui/` 변경 없음. 더미 데이터 임시 변경 없음
- 브라우저 확인 결과(headless Chrome + playwright-core 스크립트, dev 서버, 2026-10-25): 1280px에서 mock-3·mock-5 모두 `<img>` 없이 `ImageOff` 아이콘 + `bg-muted` 정사각형(236×236px, 다른 카드와 동일), 정상 이미지 7장은 `naturalWidth > 0`으로 로드됨. 콘솔 오류·경고 0건("An empty string was passed to the src attribute" 없음). mock-8 "기타" 배지. mock-1은 `<a href target="_blank" rel="noopener noreferrer">`, hover 시 이미지 opacity 1 → 0.9, 커서 `pointer`, 클릭 시 새 탭 `https://example.com/products/oak-side-table`이 열리고 원래 탭은 `http://localhost:3000/` 유지. mock-7은 `<div>`(`<a>` 0개), 커서 `auto`, 배지 opacity 0.6, 클릭해도 새 탭·주소 변화 없음. 375px 다크 모드: 2열(1·2번 카드 top 동일, 3번은 다음 줄), 대체 그림 164×164px 정사각형, `bg-muted`와 아이콘 구분됨. 보완 후 mock-5 대체 그림을 데스크톱·모바일 각 3회(총 6회) 새로 고침으로 재현 확인 — 모두 대체 그림, 정상 이미지 오탐 0. 스크린샷 `.playwright-mcp/task-004-desktop.png`·`task-004-hover.png`·`task-004-no-link.png`·`task-004-mobile.png`
- 흐린 배지 최종 결정: `opacity-60` 유지 (데스크톱·다크 스크린샷에서 mock-7 배지가 다른 배지와 충분히 구분됨)
- 변경 파일 확인: `git diff --stat`에서 `src/` 변경은 `item-card.tsx` 하나. 칩 포커스 링 잘림(범위 밖 메모)은 이번 확인 범위(마우스·스크립트)에 포함하지 않아 미확인
- 남긴 일: 없음. 다음은 Task 006(Notion 데이터 연결)
