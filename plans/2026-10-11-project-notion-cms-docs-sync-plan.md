# PRD·ROADMAP 문서 동기화 계획 (Task 002까지 반영)

## Context

Task 000~002가 끝나 코드와 문서가 어긋난 곳이 생겼다. 검증 결과(2026-10-11): lint·build 통과, `/` Revalidate 5m, 브라우저에서 제목·설명·"소품 9개"와 콘솔 오류 없음, `fetchAllRows()`로 Notion 7행 조회(열 타입 `이름`=title·`상품 링크`=url·`종류`=select·`이미지 URL`=url). 이 사실을 PRD와 ROADMAP에 반영한다. 두 문서 모두 직접 Edit하고 `git diff`로 검증한다 (ROADMAP의 완료 처리는 development-planner가 이미 했고, 남은 것은 본문 동기화라 직접 고친다).

## 1. `docs/prd/prd.md`

1. 맨 위 작성일 줄 뒤에 `갱신일: 2026-10-11 (Task 002까지의 구현 반영. 진행 상태는 docs/roadmap/ROADMAP.md)` 추가
2. 가정 "**`@notionhq/client` 버전**": "아직 설치되지 않았다 …" → "2026-10-11 Task 002에서 5.27.0 설치 완료. 전체 행 수집은 `collectPaginatedAPI`로 한다 (SDK의 `collectAllDataSourceRows`는 정렬을 오름차순으로 고정해 쓰지 않음)"
3. 데이터 모델 Living Wishlist 표 아래에 한 줄: "2026-10-11 실제 확인(Task 002): 열 타입은 `이름`=제목(title), `상품 링크`=URL, `종류`=선택(select), `이미지 URL`=URL. 7행"
4. "조회 키" 항목: `collectAllDataSourceRows 또는 next_cursor 반복` → `collectPaginatedAPI`로 `next_cursor`를 끝까지 따라감. 구현은 `src/lib/notion.ts`의 `fetchAllRows()`(Task 002), `Item` 매핑은 Task 006
5. Item 절 설명 뒤에: "구현: `src/lib/items.ts`의 `Item` 타입과 `OTHER_CATEGORY = "기타"` 상수 (Task 001)"
6. 기술 스택 "**@notionhq/client 5.x (설치 예정, 기획 문서 기준 5.27.0)**" → "**@notionhq/client 5.27.0** (2026-10-11 설치)". 설치 재확인 문장은 "설치 시 `*.d.ts`로 확인함"으로 과거형
7. 정합성 검증 결과 앞에 새 절 `## 🚧 구현 현황 (2026-10-11)` 추가:
   - 기반 완료: `Item` 타입(`src/lib/items.ts`), 더미 소품 9개(`src/lib/mock-items.ts`, Task 006에서 삭제), `WishlistView` 자리(`src/components/features/wishlist/wishlist-view.tsx`, "소품 N개"), Notion 클라이언트·`fetchAllRows()`(`src/lib/notion.ts`), `.env.local`·README 환경변수 절
   - 기능별 표: F001~F004 미구현(Task 003~005), F010 `revalidate = 300` 적용 완료·갱신 확인은 Task 007, F011 환경변수 누락 한국어 오류 완료·오류 화면 확인은 Task 007
   - 화면은 아직 더미 데이터. 실제 연결은 Task 006
8. 정합성 검증 결과의 "미설치 라이브러리(`@notionhq/client`)는 (설치 예정)으로 표기했다" → "2026-10-11 `@notionhq/client` 5.27.0 설치를 반영했다". 끝에 "2026-10-11 Task 000~002 구현을 반영해 가정·데이터 모델·기술 스택·구현 현황 갱신" 한 줄 추가

## 2. `docs/roadmap/ROADMAP.md`

1. 작성일 줄 뒤에 `갱신일: 2026-10-11 (Task 002 완료 반영)` 추가
2. "활용하는 기존 코드" 절에 Task 001·002 산출물 추가: `src/lib/items.ts`(`Item`, `OTHER_CATEGORY`), `src/lib/mock-items.ts`(Phase 2 확인용), `src/components/features/wishlist/wishlist-view.tsx`(`items` prop), `src/lib/notion.ts`의 `fetchAllRows()`(`PageObjectResponse[]` 반환)
3. Task 006 본문에 한 줄 추가: "`fetchAllRows()`는 `collectPaginatedAPI`로 모은 `PageObjectResponse[]`를 돌려주므로, 매핑은 `properties["이름"]` 등을 Task 002에서 확인한 타입(title·url·select·url)으로 읽는다. `isFullPage` 필터는 이미 적용됨"
4. 완료 표시(Task 000~002 ✅, Phase 0·1 ✅, Task 003 우선순위)는 이미 되어 있어 손대지 않음

## 검증

1. `git diff docs/prd/prd.md docs/roadmap/ROADMAP.md`로 계획한 곳만 바뀌었는지 확인
2. PRD의 F ID 6개와 ROADMAP 대조표가 그대로인지 grep
3. 계획 파일을 `plans/2026-10-11-project-notion-cms-docs-sync-plan.md`로 옮기고 완료 상태 추가. 커밋은 `/ship`(Task 002 변경과 함께)

## 완료 상태 (2026-10-11)

- ✅ 검증: lint·build 통과, `/` Revalidate 5m, 브라우저 제목·설명·"소품 9개"·콘솔 오류 없음, Notion 7행 조회(열 타입 title·url·select·url)
- ✅ `docs/prd/prd.md`: 갱신일, SDK 가정, 데이터 모델 확인 줄·조회 방식, Item 구현 위치, 기술 스택 5.27.0, "구현 현황" 절, 정합성 검증 2줄
- ✅ `docs/roadmap/ROADMAP.md`: 갱신일, 활용 코드에 Task 001·002 산출물, Task 006에 매핑 기준 한 줄 (완료 표시는 development-planner가 이미 처리)
- 커밋은 `/ship`으로 (Task 002 변경과 함께)

## 남은 작업

- 없음. 다음은 "Task 003 작업 파일 만들어줘"
