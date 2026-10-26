# Task 010: 상품 링크로 이미지 URL 채우기 스크립트 만들기

담당 기능: F020 · Phase 6 · 상태: 완료

## 목표

Notion에 "이름 + 상품 링크"만 적은 행의 "이미지 URL"을 사용자가 로컬에서 실행하는 스크립트가 채워, 카드에 그림이 나오게 한다. PRD의 F020(이미지 URL 자동 채우기, 로컬 스크립트)을 구현한다. 사이트(`src/`)는 계속 Notion을 읽기만 하고, Notion에 쓰는 코드는 이 스크립트뿐이다. 계획: `plans/2026-10-26-project-notion-cms-task-010-plan.md`.

## 관련 파일

- 새로 만들 파일: `scripts/fill-images.ts`, `scripts/register-ts-paths.mjs`
- 고칠 파일:
  - `src/lib/notion.ts` — `COLUMN`에 `export`만 추가
  - `README.md` — "환경변수" 절에 통합 권한 문단, 새 절 "## 이미지 채우기", "자주 쓰는 명령"에 한 줄
  - `package.json` — `"fill-images"` 스크립트 1줄. developer는 설정 파일을 못 고치므로 **메인 대화가 추가한다** (`.claude/rules/dependencies.md` 확인)
- 참고할 기존 코드: `src/lib/notion.ts`의 `fetchAllRows`·`toSafeUrl`·`requireEnv`·`readUrl`·`COLUMN`
- 읽을 규칙: `CLAUDE.md` "코드 규칙", `.claude/rules/library-docs.md` (Notion `pages.update`는 처음 쓰는 API → 쓰기 전에 `node_modules/@notionhq/client`의 `*.d.ts`에서 호출 형태 확인)

## 명세

스크립트 동작 (`npm run fill-images`):

- 기본은 **미리보기**: 무엇을 바꿀지 표로만 보여 주고 Notion에 쓰지 않는다. `--write`를 붙여야 실제로 쓴다. `--all`은 이미 그림이 있는 행도 다시 추출해 "찾은 값 = Notion 값"인지 비교만 한다(추출 로직 검증용, 쓰지 않음)
- 실행 명령 형태: `node --env-file-if-exists=.env.local --import ./scripts/register-ts-paths.mjs scripts/fill-images.ts [--write] [--all]`

1. `fetchAllRows()`(기존)로 전체 행을 읽는다. 환경변수가 없으면 기존 `requireEnv`의 한국어 오류가 그대로 보인다
2. 행마다 `readUrl`과 같은 규칙(`toSafeUrl`)으로 "상품 링크"·"이미지 URL"을 읽는다. 링크가 비면 건너뛴다(`링크 없음`)
3. 대상 판정: "이미지 URL"이 비었으면 대상. 비어 있지 않으면 HEAD 요청으로 `content-type`을 보고 `image/*`면 건너뛴다(`이미 그림`). 그 외(HTML, 429 등)는 대상
4. 추출 순서 (모두 우리 봇 User-Agent `LivingWishlistBot/1.0`, Accept는 받으려는 형식, 요청당 10초 `AbortSignal.timeout`, 재시도 없음, 행은 순서대로 하나씩):
   1. 링크 경로가 `/products/<handle>`이면 Shopify 공개 JSON `<origin>/products/<handle>.json` → `product.images[0].src` (없으면 `product.image.src`)
   2. 상품 페이지 HTML → `<meta property="og:image" content="…">` (`name="og:image"`도 허용, 상대 주소는 `new URL(content, 링크)`로 절대화). 없으면 `twitter:image`
5. 검증: 찾은 주소를 `toSafeUrl`에 통과시키고 HEAD로 `content-type`이 `image/*`인지 확인. 통과하지 못하면 `못 찾음`
6. `--write`일 때만 `notion.pages.update({ page_id, properties: { [COLUMN.imageUrl]: { url } } })`로 그 열 하나만 바꾼다. 다른 열은 건드리지 않는다
7. 출력: 행마다 한 줄 `이름 | 링크 host | 결과(이미 그림·채움·채울 예정·못 찾음(429)·링크 없음) | 찾은 이미지 host`, 마지막에 집계. 비밀 값은 찍지 않는다. Notion 쓰기 실패(권한 없음 등)는 오류 메시지를 보여 주고 종료 코드 1

안전장치:

- 호스트가 `localhost`·IP 숫자 주소·`.local`이면 요청하지 않는다 (사용자가 적은 주소를 스크립트가 대신 여는 구조이므로)
- 브라우저 흉내 헤더(Chrome UA·sec-ch 헤더)는 넣지 않는다. 사이트가 거부(429·403)하면 그대로 `못 찾음`으로 두고 사용자가 Notion에 직접 적는다
- "콘텐츠 삽입"은 끈 채로 둔다 — 새 행을 만들지 않는다

코드 규칙:

- Node 24는 `.ts`를 타입만 지우고 직접 실행하므로 `enum`·네임스페이스 같은 "타입만이 아닌 TS 문법"은 쓰지 않는다
- tsconfig가 `.ts` 확장자 import를 허용하지 않으므로 `src/lib/notion`은 확장자 없이 `../src/lib/notion`으로 import한다. `register-ts-paths.mjs`의 resolve 훅이 `@/` → `src/`, 확장자 없는 경로 → `.ts`를 붙여 풀어 준다
- 주석·화면(터미널) 문구는 한국어, 큰따옴표·세미콜론 없음, `any` 금지, 비밀 값 출력 금지

`scripts/register-ts-paths.mjs` 내용 (그대로 써도 된다):

```js
import { registerHooks } from "node:module"
import { pathToFileURL } from "node:url"
const SRC = pathToFileURL(`${process.cwd()}/src/`).href
registerHooks({
  resolve(specifier, context, nextResolve) {
    const spec = specifier.startsWith("@/") ? SRC + specifier.slice(2) : specifier
    try { return nextResolve(spec, context) } catch (err) {
      const noExt = !/\.[a-zA-Z0-9]+$/.test(spec)
      if (err?.code === "ERR_MODULE_NOT_FOUND" && noExt) return nextResolve(`${spec}.ts`, context)
      throw err
    }
  },
})
```

## 구현 단계

- [x] 1. `src/lib/notion.ts`의 `COLUMN`에 `export` 추가 (다른 줄은 건드리지 않음)
- [x] 2. `scripts/register-ts-paths.mjs` 만들기 (위 내용)
- [x] 3. `scripts/fill-images.ts` 만들기: 행 읽기 → 대상 판정 → 추출(Shopify JSON → og:image → twitter:image) → 검증 → `--write`일 때만 쓰기 → 출력·집계. 쓰기 전에 `node_modules/@notionhq/client`의 `*.d.ts`에서 `pages.update` 호출 형태 확인
- [x] 4. `README.md`: "환경변수" 절에 통합 권한 중 "콘텐츠 업데이트"를 켜야 채우기가 된다는 문단, 새 절 "## 이미지 채우기"(명령 두 가지, 되는 사이트/안 되는 사이트), "자주 쓰는 명령"에 `npm run fill-images` 한 줄
- [x] 5. (메인 대화) `package.json`에 `"fill-images": "node --env-file-if-exists=.env.local --import ./scripts/register-ts-paths.mjs scripts/fill-images.ts"` 추가
- [x] 6. `npm run lint` → `npm run check-all` → `npm run build`
- [x] 7. 터미널 확인과 사용자 선택 확인 (아래 완료 기준. 사용자 선택 확인은 선택 사항으로 남김)

## 완료 기준

- [x] `npm run lint` 통과 (경고 0, `scripts/*.ts`도 대상)
- [x] `npm run check-all` 통과 (tsc가 스크립트도 검사)
- [x] `npm run build` 통과, `/` Revalidate 5m 유지
- [x] 터미널 확인: `npm run fill-images -- --all` — 추출이 되는 5행(my-choice·linenworld ×2·puebco·audocph)은 모두 그림 주소를 찾고(`일치` 1·`불일치` 4 — 불일치는 Notion에 손으로 적힌 썸네일이 사이트 대표 이미지와 다른 파일이기 때문, 추출 실패 아님), 네이버 5행은 `못 찾음(429)`, 아무 행도 쓰지 않음(Notion `last_edited_time` 불변). 처음 기대("4행 일치, audocph 429")는 실측에 맞게 2026-10-26 수정
- [x] 터미널 확인: `npm run fill-images` — 대상은 네이버 5행뿐이고 모두 `못 찾음` → 바꿀 것 없음
- [x] 터미널 확인: `npm run fill-images -- --write` — 쓸 것이 없어 Notion에 변화 없음
- [x] 터미널 확인: 환경변수 없이 실행(`NOTION_API_KEY= npm run fill-images`) → 기존 한국어 오류 메시지
- [x] `.env.local` 미수정, 출력에 비밀 값 없음
- [ ] 사용자 선택 확인: Notion에서 puebco 행의 이미지 URL을 지우고 `npm run fill-images -- --write` → `채움`, 약 5분 뒤 배포 사이트 카드에 그림 복귀 (사용자가 결정)

## 변경 요약

- (developer, 2026-10-26, 단계 1·2·3·4·6 + 터미널 확인 일부) 바뀐 파일 4개 (`package.json`은 메인 대화가 먼저 추가):
  - `src/lib/notion.ts` 14행: `const COLUMN` → `export const COLUMN`. 다른 줄 변경 없음
  - `scripts/register-ts-paths.mjs` (새 파일): 작업 파일의 훅 내용 + `.ts`로 풀린 결과에 `format: "module-typescript"`를 붙이는 한 줄. 루트 `package.json`에 `"type"`이 없어 Node가 `src/lib/notion.ts`를 읽을 때마다 `MODULE_TYPELESS_PACKAGE_JSON` 경고를 찍었는데, 형식을 미리 알려 주면 추측을 건너뛰어 경고가 사라진다 (스크래치패드에서 `.mts` 진입 파일·`scripts/package.json` 방식은 경고가 그대로였음을 확인하고 이 방식을 택함. `package.json`을 고치지 않아도 된다)
  - `scripts/fill-images.ts` (새 파일): `fetchAllRows`·`toSafeUrl`·`COLUMN`을 `../src/lib/notion`에서 import. 옵션 `--write`·`--all`만 받고 그 외는 사용법을 찍고 종료(코드 0). 흐름: 행 읽기 → 링크 없음/잘못됨/내부 주소 판정 → (`--all` 아닐 때) 기존 "이미지 URL"을 HEAD로 확인해 `image/*`면 `이미 그림` → 추출(Shopify `/products/<handle>.json` → `og:image` → `twitter:image`, 상대 주소 절대화, `&amp;` 등 엔티티 복원) → 검증(`toSafeUrl` → 내부 주소 차단 → HEAD `image/*`) → `--write`면 `notion.pages.update({ page_id, properties: { [COLUMN.imageUrl]: { url } } })`. HEAD를 405·501로 거부하면 `GET` + `Range: bytes=0-0`으로 대신 확인. 모든 요청은 `LivingWishlistBot/1.0 (+https://project-notion-cms.vercel.app)` UA, 10초 `AbortSignal.timeout`, 재시도 없음, 행 순차 처리. 출력은 `이름 | 링크 host | 결과 | 찾은 이미지 host` + 집계. Notion 읽기 실패·쓰기 실패는 메시지(SDK 오류면 `code: message`) 출력 후 종료 코드 1, 쓰기 실패 시 그 행에서 멈춤
  - `README.md`: "환경변수" 절 끝에 통합 권한 3가지(읽기·업데이트·삽입) 문단, 새 절 "## 이미지 채우기"(명령 3가지, 동작 방식, 되는 사이트/안 되는 사이트, 내부 주소 차단), "자주 쓰는 명령"에 `npm run fill-images` 1줄
- 결정 사항:
  - `--all`과 `--write`를 함께 주면 `--all`이 우선해 쓰지 않는다(안내 문구 출력). `--all`의 결과 문구는 `일치`·`불일치`·`찾음(Notion은 비어 있음)`·`못 찾음(…)`
  - 명세에 없는 결과 문구 2개 추가: `링크 잘못됨`(`https://` 뒤가 URL로 파싱 안 될 때), `건너뜀(내부 주소)`. `못 찾음`의 괄호에는 HTTP 상태(429 등)·`og:image 없음`·`시간 초과`·`네트워크`·`그림 아님 <상태>`가 들어간다
  - `requireEnv`·`readUrl`·`readTitle`은 export하지 않고(작업 파일 "다른 줄은 건드리지 않음") 스크립트가 같은 규칙으로 다시 읽는다. 쓰기용 `Client`는 `fetchAllRows()` 성공 뒤 `process.env.NOTION_API_KEY`로 만든다
- 검증(developer): `npm run lint` 경고 0(`npx eslint scripts --max-warnings 0`로 `scripts/`가 대상임을 확인) · `npm run check-all` 통과 · `npm run build` 통과, `○ / 5m 1y` 유지 · Node 경고 0건
- 터미널 확인 결과(developer, Notion 10행, `--write`는 실행하지 않음):
  - `npm run fill-images` (미리보기): `이미 그림` 5(audocph·my-choice·linenworld ×2·puebco), `못 찾음(429)` 5(네이버 5행), `채울 예정` 0 → 기대와 일치
  - `NOTION_API_KEY= npm run fill-images`: `Notion 읽기 실패: 환경변수 NOTION_API_KEY가 없습니다. .env.local을 확인하세요`, 종료 코드 1 → 기대와 일치
  - `npm run fill-images -- --all`: **기대와 다름** — `일치` 1(Campbell Linen Sofa), `불일치` 4, `못 찾음(429)` 5(네이버). 원인은 추출 실패가 아니라 Notion에 손으로 적힌 값이 지금 페이지가 주는 값과 다른 것: my-choice(Notion `cdn-optimized.imweb.me/upload/…?w=750` vs og:image `cdn.imweb.me/thumbnail/…`), linenworld Valley Box(같은 host, 파일명 `10001-2-2048x2048.jpg` vs `10002-scaled.jpg`), puebco(Notion `puebco.kr/cdn/shop/products/109336_3_sf_700x.jpg` vs Shopify JSON `cdn.shopify.com/…/109336_5_sf.jpg`), audocph(Notion `audocph.com/cdn/shop/files/…` vs Shopify JSON `cdn.shopify.com/…` 같은 파일). audocph는 HTML은 429지만 Shopify JSON은 200이라 `못 찾음`이 아니라 추출에 성공했다(기대보다 좋은 결과). 비교는 문자열 완전 일치이며 "같은 상품의 다른 썸네일"은 구분하지 않는다. 아무 행도 쓰지 않았다
- 메인 대화 확인(2026-10-26): `--all` 결과는 developer 실측과 동일(`일치 1 · 불일치 4 · 못 찾음 5`)이라 완료 기준의 기대값을 실측에 맞게 고쳤다. 기본 미리보기 `이미 그림 5 · 못 찾음 5`, `--write` 실행 결과도 같고 Notion 최신 `last_edited_time`이 실행 전후 동일(`2026-10-26T05:40:00Z`, 10행). 사용자 선택 확인(puebco 행 비우고 `--write`)은 미실행으로 남김. `package.json`의 `fill-images` 1줄은 메인 대화가 추가
- 남긴 일: 사용자 선택 확인(선택 사항) · `/ship`
