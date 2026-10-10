# 로드맵 Task 쪼개기 계획

## Context

`docs/roadmap/ROADMAP.md`의 Task 002(카드·그리드)와 Task 004(Notion 연결)는 한 Task에 기능 3개와 확인 항목 7가지가 몰려 있어, 구현하다 틀려도 원인을 좁히기 어렵다. 두 Task를 각각 둘로 나눠 "한 Task = 고치는 파일 적고, 브라우저(또는 터미널) 확인 방법 한 가지"가 되게 한다. 나머지 Task는 크기가 적당해 그대로 둔다.

`development-planner` 규칙(`.claude/agents/development-planner.md`)이 "번호는 세 자리 연속, `006-1` 같은 가지 번호 금지"라서 002a 대신 **002~008로 다시 매긴다**. 아직 `docs/roadmap/tasks/`에 실제 작업 파일이 없어 번호를 바꿔도 깨지는 링크가 없다 (다른 문서에서 Task 번호를 참조하는 곳도 없음을 grep으로 확인).

## 고칠 파일

- `docs/roadmap/ROADMAP.md` 하나만. 직접 Edit한다 (바꿀 문장을 이미 정해 두었고, 에이전트에 맡기면 문구가 바뀔 위험이 있어 `git diff`로 검증하기 쉬운 쪽을 택함)
- 승인 뒤 이 계획 파일을 `plans/2026-10-10-project-notion-cms-roadmap-task-split-plan.md`로 옮긴다

## 변경 내용

### 1. Phase 2 — Task 002를 둘로

- **Task 002: 기본 소품 카드와 카드 그리드 만들기** · 담당 기능: F001
  - `item-card.tsx`: shadcn `Card` 안에 정사각형 이미지 영역(`aspect-square`, 일반 `<img>` + `object-cover`, `next/image` 사용 안 함, `alt`는 소품 이름), 이름, 종류 `Badge`. 이 Task에서는 `"use client"` 없이 정상 데이터만 그린다
  - `item-grid.tsx`: `grid grid-cols-2 gap-4 lg:grid-cols-4`로 `ItemCard` 나열
  - `wishlist-view.tsx`에서 개수 문구를 지우고 `ItemGrid`를 그림
  - 완료 기준: lint·build 통과, 375px 2열·1280px 4열, 카드에 이미지·이름·배지가 보임
- **Task 003: 카드의 예외 상태 만들기** · 담당 기능: F002, F004
  - `item-card.tsx`에 `"use client"` 추가, `imageUrl` 비었거나 `onError` 시 `bg-muted` + `ImageOff` 대체 그림(같은 크기)
  - 링크 처리: `url` 있으면 `<a target="_blank" rel="noopener noreferrer">`, 없으면 `<div>` + 기본 커서 + 흐린 배지
  - `"기타"` 배지 확인
  - 완료 기준: lint·build 통과, 깨진·빈 이미지 대체 그림, "기타" 배지, 링크 카드 새 탭(원래 탭 유지), 링크 없는 카드 클릭 무반응

### 2. Task 003(칩·빈 상태) → **Task 004**로 번호만 변경. 문구 그대로

### 3. Phase 3 — Task 004를 둘로

- **Task 005: Notion SDK 설치와 연결 준비하기** · 담당 기능: 기반 (전 기능 공통), F011
  - 규칙 파일 읽고 `@notionhq/client` 5.x 설치, `*.d.ts`로 `dataSources.query`·전체 행 수집 도우미 확인, `README.md` 기술 스택 표에 버전 추가
  - `.env.local`에 `NOTION_API_KEY`·`NOTION_DATA_SOURCE_ID`, `.gitignore` 미추적 확인, README에 얻는 방법 한 절
  - `src/lib/notion.ts` 1차: 클라이언트 생성, 환경변수 없으면 한국어 오류, `fetchAllRows()` — 데이터 소스 ID로 `dataSources.query`, `created_time` 내림차순, `next_cursor` 반복으로 전체 행. **매핑은 아직 없음**(원시 응답 그대로 반환)
  - `page.tsx`는 건드리지 않는다
  - 완료 기준: lint·build 통과, 터미널에서 행 개수 확인 — `node --env-file=.env.local --input-type=module -e "import('./src/lib/notion.ts').then(m => m.fetchAllRows()).then(r => console.log(r.length))"` (Node 24는 TS를 바로 실행. 안 되면 `page.tsx`에 임시 `console.log` 후 제거). 환경변수를 하나 지우면 한국어 오류가 찍힘
- **Task 006: Notion 소품을 Item으로 바꿔 화면에 연결하기** · 담당 기능: F001, F010, F011
  - `notion.ts` 2차: `getItems(): Promise<Item[]>` — 열 이름 ↔ `Item` 매핑("이름"→`name`, "상품 링크"→`url`, "종류"→`category`(비면 `"기타"`), "이미지 URL"→`imageUrl`), `any` 금지·타입 가드
  - `page.tsx`를 `async`로, `await getItems()`를 `WishlistView`에 전달, 오류는 잡지 않고 던져 `app/error.tsx`로
  - `src/lib/mock-items.ts` 삭제
  - 완료 기준: lint·build 통과(`.env.local` 필요), `npm run dev`에서 실제 소품이 최근순 카드로, 칩·링크·대체 이미지·"기타"가 실제 데이터로 동작

### 4. Task 005(갱신·오류 확인) → **Task 007**, Task 006(배포) → **Task 008**. 문구 그대로. 단 하나 수정

- 옛 Task 005의 "`CLAUDE.md` '진행 중인 작업'의 ... 문장을 현재 상태로 갱신하고" 부분은 삭제 (CLAUDE.md에 그 절이 이미 없음). `README.md` 첫 문단 수정 부분만 남긴다

### 5. 번호 참조 정리

- `## 📌 가정`: "Notion 연결(Task 004)" → Task 006, "Task 004부터 `npm run build`가" → Task 006
- `## 기능 ↔ Task 대조표` 갱신:

| 기능 | Task |
|---|---|
| F001 | 002, 006 |
| F002 | 003 |
| F003 | 004 |
| F004 | 003, 004 |
| F010 | 001, 006, 007, 008 |
| F011 | 005, 006, 007, 008 |

- "기반 Task" 줄에 Task 005 추가
- 우선순위 표시는 Task 001에 그대로

## 검증

1. `git diff docs/roadmap/ROADMAP.md`로 바뀐 부분만 바뀌었는지 확인 (가정 2줄, Phase 2·3 본문, 대조표, 기반 Task 줄, 옛 Task 005 한 줄)
2. `grep -n "Task 00[0-9]" docs/roadmap/ROADMAP.md`로 000~008이 빠짐없이 연속인지, 대조표의 F ID 6개가 모두 있는지 확인
3. 계획 파일 이름 변경 후 "완료 상태" 절 추가

## 완료 상태 (2026-10-10)

- ✅ `docs/roadmap/ROADMAP.md` 수정: Task 002 → 002(기본 카드·그리드) + 003(예외 상태), Task 004 → 005(SDK·연결 준비) + 006(매핑·화면 연결), 나머지 007·008로 번호 이동. 가정 절 번호 2곳, 대조표, 기반 Task 줄, 옛 Task 005의 낡은 `CLAUDE.md` 언급 정리
- ✅ `git diff`로 계획 밖 문구가 바뀌지 않았는지 확인, Task 000~008 연속 확인
- 커밋은 아직 안 함 (`/ship`으로 올린다)

## 남은 작업

- 없음. 다음은 "Task 001 작업 파일 만들어줘"로 첫 Task 시작
