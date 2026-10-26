# Task 010 계획: 상품 링크로 이미지 URL 채우기 스크립트 (MVP 이후 1차)

작성일: 2026-10-26 · 저장 위치(승인 후): `plans/2026-10-26-project-notion-cms-task-010-plan.md`

## 배경 (Context)

- Notion에 "이름 + 상품 링크"만 적어도 카드에 그림이 나오게 하고 싶다. 지금은 "이미지 URL" 칸을 사람이 채워야 하고, 10행 중 5행(네이버)은 상품 페이지 주소가 들어 있어 대체 그림이 뜬다.
- 2026-10-26 실측(10개 링크, 우리 이름을 밝힌 `LivingWishlistBot/1.0` User-Agent): og:image 추출 성공 my-choice.kr·linenworld.pro ×2, Shopify 공개 상품 JSON(`/products/<handle>.json`) 성공 puebco.kr. 실패(429) brand.naver.com ×4·smartstore ×1·audocph.com.
- 사용자 결정(2026-10-26): ① 브라우저 위장(Chrome UA·sec-ch 헤더 흉내)은 쓰지 않는다 ② Notion 통합에 "콘텐츠 업데이트" 권한을 켰다(같은 값 재저장으로 쓰기 성공 확인) ③ 네이버 검색 API 연동은 지금 하지 않는다.
- 구조 결정: 사이트 런타임(ISR)에서 가져오지 않고, **사용자가 로컬에서 실행하는 1회성 채우기 스크립트**가 비어 있거나 그림이 아닌 "이미지 URL"을 추출해 **Notion 열에 써 넣는다**. 사이트 코드는 지금처럼 Notion만 읽는다(PRD "읽기 전용" 유지). Notion이 진실의 원천으로 남아 결과를 바로 보고 손으로 고칠 수 있고, Vercel 데이터센터 IP 차단 문제를 피한다.

## 결과물

1. `scripts/fill-images.ts` — 채우기 스크립트 (새 파일)
2. `scripts/register-ts-paths.mjs` — Node가 `@/` 별칭·확장자 없는 import를 풀 수 있게 하는 작은 resolve 훅 (새 파일, 이 세션의 scratchpad 훅과 같은 내용)
3. `src/lib/notion.ts` — `COLUMN`에 `export` 한 단어 추가 (열 이름은 이 파일에만 둔다는 규칙 유지)
4. `package.json` — `"fill-images": "node --env-file-if-exists=.env.local --import ./scripts/register-ts-paths.mjs scripts/fill-images.ts"` 스크립트 1줄 (설정 파일이라 메인 대화가 직접 고친다, `.claude/rules/dependencies.md` 확인)
5. 문서: PRD(`docs/prd/prd.md`), ROADMAP(Phase 6 + Task 010), `docs/roadmap/tasks/010-fill-images-script.md`, README("환경변수"에 권한 안내 + 새 절 "이미지 채우기")

패키지 설치 없음. Node 24가 `.ts`를 그대로 실행한다(타입만 지움). 이 세션에서 같은 방식으로 `src/lib/notion.ts`를 터미널에서 실행해 확인했다.

## 스크립트 동작 (`npm run fill-images`)

기본은 **미리보기(dry-run)**: 무엇을 어떻게 바꿀지 표로만 보여 주고 Notion에는 쓰지 않는다. `npm run fill-images -- --write`를 붙여야 실제로 쓴다. `--all`을 붙이면 이미 그림이 있는 행도 다시 추출해 "찾은 값 = Notion 값"인지 비교만 한다(추출 로직 검증용, 쓰지 않음).

1. `fetchAllRows()`(기존)로 전체 행을 읽는다. 환경변수가 없으면 기존 `requireEnv`의 한국어 오류가 그대로 보인다.
2. 행마다 `readUrl`과 같은 규칙(`toSafeUrl`, 기존 export)으로 "상품 링크"·"이미지 URL"을 읽는다. 링크가 비면 건너뛴다(`링크 없음`).
3. 대상 판정: "이미지 URL"이 비었으면 대상. 비어 있지 않으면 HEAD 요청으로 `content-type`을 보고 `image/*`면 건너뛴다(`이미 그림`). 그 외(HTML, 429 등)는 대상(네이버 4행이 여기 해당).
4. 추출 순서(모두 우리 봇 UA, Accept는 받으려는 형식, 요청당 10초 `AbortSignal.timeout`, 재시도 없음, 행은 순서대로 하나씩):
   1. 링크 경로가 `/products/<handle>`이면 Shopify 공개 JSON `<origin>/products/<handle>.json` → `product.images[0].src` (없으면 `product.image.src`)
   2. 상품 페이지 HTML → `<meta property="og:image" content="…">` (`name="og:image"`도 허용, 상대 주소는 `new URL(content, 링크)`로 절대화). 없으면 `twitter:image`
5. 검증: 찾은 주소를 `toSafeUrl`에 통과시키고 HEAD로 `content-type`이 `image/*`인지 확인. 통과하지 못하면 `못 찾음`.
6. `--write`일 때만 `notion.pages.update({ page_id, properties: { [COLUMN.imageUrl]: { url } } })`로 그 열 하나만 바꾼다. 다른 열은 건드리지 않는다.
7. 출력: 행마다 한 줄 `이름 | 링크 host | 결과(이미 그림·채움·채울 예정·못 찾음(429)·링크 없음) | 찾은 이미지 host`, 마지막에 집계. 비밀 값은 찍지 않는다. Notion 쓰기 실패(권한 없음 등)는 오류 메시지를 보여 주고 종료 코드 1.

안전장치: 호스트가 `localhost`·IP 숫자 주소·`.local`이면 요청하지 않는다(사용자가 적은 주소를 스크립트가 대신 여는 구조이므로). 브라우저 흉내 헤더는 넣지 않는다. 사이트가 거부(429·403)하면 그대로 `못 찾음`으로 두고 사용자가 Notion에 직접 적는다.

## 문서 변경

- **PRD**: "MVP 이후 기능 (제외)" 목록의 "상품 링크에서 가격·이미지 자동 수집" 중 이미지 부분을 빼고, 새 절 "### 4. MVP 이후 1차: 입력 도우미"에 **F020 이미지 URL 자동 채우기(로컬 스크립트)** 를 기능 표 형식으로 추가(설명·이유·범위 밖: 브라우저 위장 안 함, 네이버·거부 사이트는 수동, 사이트는 계속 읽기 전용). 데이터 모델 "이미지 URL" 설명에 "비워 두면 `npm run fill-images`가 채울 수 있다" 한 줄. 구현 현황 표에 F020 행. 번호는 F012를 비워 둔 2026-10-09 결정을 지키고, 핵심 00x·지원 01x 다음 묶음으로 02x를 쓴다.
- **ROADMAP** (development-planner): 갱신일, 가정에 "Notion 통합 권한: 2026-10-26 '콘텐츠 업데이트' 켬. 쓰기는 로컬 스크립트만" 추가, "현재 상태"에 Phase 6 진행, `### Phase 6: 입력 도우미 (MVP 이후)`에 Task 010, 기능↔Task 대조표에 F020, "제외" 목록에서 이미지 자동 수집을 빼고 "네이버 검색 API 연동(키 필요, 보류)"을 넣는다.
- **Task 010 파일** (development-planner, `000-sample.md` 형식): 위 동작·검증을 명세와 구현 단계로.
- **README** (developer): "환경변수" 절에 통합 권한 3가지 중 "콘텐츠 업데이트"를 켜야 채우기가 된다는 문단, 새 절 "## 이미지 채우기"에 명령 두 가지와 "되는 사이트/안 되는 사이트" 설명, "자주 쓰는 명령"에 `npm run fill-images` 한 줄.

## 진행 순서

1. 메인 대화: 이 계획을 `plans/2026-10-26-project-notion-cms-task-010-plan.md`로 저장, PRD 수정
2. development-planner: ROADMAP Phase 6·Task 010 + `docs/roadmap/tasks/010-fill-images-script.md`
3. developer: `scripts/fill-images.ts`, `scripts/register-ts-paths.mjs`, `notion.ts`의 `export`, README. lint·check-all·build. (`package.json`은 못 고치므로 보고만)
4. 메인 대화: `package.json`에 스크립트 1줄 추가, 아래 검증, 작업 파일 완료 처리
5. `/ship` (src/ 변경 있음 → code-reviewer)

## 검증

- `npm run lint` 경고 0 (`scripts/*.ts`도 ESLint 대상), `npm run check-all`(tsc가 `**/*.ts`를 포함하므로 스크립트도 타입 검사), `npm run build` 통과·`/` Revalidate 5m 유지
- `npm run fill-images -- --all` (미리보기): my-choice·linenworld ×2·puebco 4행이 "찾은 값 = Notion 값"으로 일치, 네이버 5행·audocph `못 찾음(429)`, 아무 행도 쓰지 않음(Notion `last_edited_time` 불변)
- `npm run fill-images` (미리보기): 대상은 네이버 5행만, 전부 `못 찾음` → 바꿀 것 없음
- `npm run fill-images -- --write`: Notion에 변화 없음(쓸 것이 없으므로). 실제 쓰기를 보려면 사용자가 Notion에서 puebco 행의 이미지 URL을 잠시 지우고 다시 실행 → `채움`, 약 5분 뒤 배포 사이트 카드에 그림 복귀(선택 사항, 사용자가 결정)
- 환경변수 없이 실행(`NOTION_API_KEY= npm run fill-images`) → 기존 한국어 오류 메시지
- `.env.local` 미수정, 비밀 값 출력 없음

## 범위 밖

- 네이버 검색 API, 브라우저 위장, 사이트 런타임(ISR) 자동 수집, 가격 수집, 새 행 만들기(통합의 "콘텐츠 삽입"은 끈 채로)

## 완료 상태 (2026-10-26)

- ✅ 1단계: 계획 파일 저장, PRD에 "3. MVP 이후 1차: 입력 도우미"(F020) 추가·제외 목록 정리·데이터 모델·구현 현황 갱신
- ✅ 2단계: development-planner — ROADMAP Phase 6·Task 010, `docs/roadmap/tasks/010-fill-images-script.md`
- ✅ 3단계: developer — `scripts/fill-images.ts`, `scripts/register-ts-paths.mjs`(`.ts`를 `module-typescript`로 알려 Node 경고 0), `notion.ts`의 `COLUMN` export, README. lint 경고 0·check-all·build 통과(`/` Revalidate 5m)
- ✅ 4단계: `package.json`에 `fill-images` 1줄. 터미널 검증: `--all` → `일치 1 · 불일치 4 · 못 찾음(429) 5`(불일치는 손으로 적힌 썸네일이 사이트 대표 이미지와 다른 파일, audocph는 Shopify JSON으로 추출 성공 — 계획의 기대값을 실측에 맞게 작업 파일에서 수정), 기본 미리보기·`--write` → `이미 그림 5 · 못 찾음 5`, Notion `last_edited_time` 전후 동일, 환경변수 없이 실행 → 한국어 오류·종료 코드 1
- 5단계: `/ship` (src/ 변경 → code-reviewer)

## 남은 작업

- 사용자 선택: Notion에서 puebco 행의 "이미지 URL"을 비우고 `npm run fill-images -- --write` → `채움` → 약 5분 뒤 배포 사이트 확인
- 네이버 행 5개는 수동 입력 (네이버 검색 API 연동은 보류, ROADMAP 제외 목록)
- code-reviewer 승인(2026-10-26) 뒤 바로 반영: 사용법 문구 `-- [--write] [--all]`, 알 수 없는 옵션은 종료 코드 1, README에 Node 22.18+/24 필요 안내. 나중에 고쳐도 되는 것(ROADMAP 제외 목록에 기록): 리다이렉트 뒤 내부 주소 차단(`redirect: "manual"` 루프), 기존 이미지 HEAD 확인 실패(null)와 "그림 아님" 구분, `--all` 비교의 주소 정규화
