# PRD 보정 (사이트 이름 + 검증 Major 4건 반영) 및 docs/prd 커밋 계획

날짜: 2026-10-09 · 프로젝트: project-notion-cms

## 배경 (Context)

`prd-generator`가 테스트로 만든 `docs/prd/2026-10-09-project-notion-cms-prd.md`를 `prd-validator`가 검증해 Major 4건을 찍었다(`docs/prd/2026-10-09-project-notion-cms-prd-validation.md` 216~248행). 사용자는 이 PRD를 정식 설계도로 쓰기로 했으므로, 4건을 PRD에 반영한 뒤 `docs/prd/`를 저장소에 올린다.

Major 4건 요약:

1. **데이터 소스 ID**: Notion SDK 5.x는 `dataSources.query({ data_source_id })`로 조회하고, 데이터베이스 ID와 데이터 소스 ID는 호환되지 않는다. PRD와 기획 문서 모두 `NOTION_DATABASE_ID`만 적어 두었다.
2. **ISR 재검증 명시**: `next.config.ts`에 `cacheComponents`가 없으므로 구 캐시 모델이다. PRD에 "5분"만 있고 구현 방식(`export const revalidate = 300`)과 확인 방법(`npm run build && npm run start`)이 없다.
3. **noindex 적용 위치**: PRD는 소품 목록 페이지에만 색인 거부를 걸었지만 `(dashboard)` 경로와 `lib/site.ts`의 메뉴 3개가 남아 있다. 루트 `app/layout.tsx`의 `metadata.robots`로 모든 경로를 덮어야 한다.
4. **사이트 이름**: 기획 문서 10장은 "Living Wishlist (2026-10-09 결정)"인데 PRD는 "인테리어 소품 후보 모아보기"로 가정했다.

## 바꾸는 파일

1. `docs/prd/2026-10-09-project-notion-cms-prd.md` (아래 표대로 편집)
2. `plans/2026-10-09-project-notion-cms-interior-service-plan.md` 41행: 환경변수 `NOTION_DATABASE_ID` → `NOTION_DATA_SOURCE_ID` (기준 문서라 PRD와 어긋나면 같은 문제가 재발하므로 한 줄만 함께 고친다)
3. `plans/2026-10-09-project-notion-cms-prd-agents-update-plan.md` "남은 작업": 완료로 표시
4. 이 계획 파일을 `plans/2026-10-09-project-notion-cms-prd-living-wishlist-fix-plan.md`로 이름 바꾸기

`.claude/agents/`는 건드리지 않는다. 검증 결과 파일(`-validation.md`)은 수정하지 않고 기록으로 그대로 둔다.

## PRD 편집 내용

| # | 위치 (현재 행) | 변경 |
|---|---|---|
| 이름-1 | 1행 제목 | `# Living Wishlist MVP PRD` (저장소 이름은 3행 기준 문서 줄에 남음) |
| 이름-2 | 7행 가정 "사이트 이름" | 항목 삭제 |
| 이름-3 | 15~18행 핵심 정보 | `**사이트 이름**: Living Wishlist (기획 문서 10장, 2026-10-09 결정. Notion 데이터베이스 이름도 같다. 고유명사라 영어 그대로 쓰고, 그 외 화면 문구는 프로젝트 규칙대로 한국어)` 한 줄 추가 |
| 이름-4 | 83행 메뉴 구조 머리 | `📱 Living Wishlist 내비게이션 (...)` |
| 이름-5 | 109행 진입 경로, 94행 | "사이트 이름" 표현은 그대로 두되 94행에 `(머리글에는 "Living Wishlist"가 보인다)` 덧붙임 |
| ID-1 | 132행 데이터 모델 글머리 아래 | 새 글머리: `**조회 키**: Notion 앱 "데이터 소스 관리 → 데이터 소스 ID 복사"로 얻은 **데이터 소스 ID**를 쓴다 (환경변수 \`NOTION_DATA_SOURCE_ID\`). 데이터베이스 ID와 호환되지 않으므로 섞어 쓰지 않는다. 소품이 100개를 넘어도 전부 가져오도록 전체 행 수집 방식(\`collectAllDataSourceRows\` 또는 \`next_cursor\` 반복)으로 조회한다` |
| ID-2 | 169행 기술 스택 `@notionhq/client` | 뒷부분 "조회 방법이 바뀌었으므로 설치 전 공식 문서를 확인한다"를 "조회는 `dataSources.query`에 **데이터 소스 ID**를 넘긴다 (데이터 모델의 '조회 키' 참조). 설치 시 `.claude/rules/library-docs.md` 절차로 버전 재확인"으로 교체 |
| ID-3 | 10행 가정 `@notionhq/client` | 유지 (버전 재확인 가정은 그대로) |
| ISR-1 | 65행 F010 설명 | 끝에 추가: `구현: \`cacheComponents\`는 켜지 않고, 소품 목록 페이지 파일에 \`export const revalidate = 300\`을 둔다. 개발 서버(\`npm run dev\`)에서는 캐시가 동작하지 않으므로 "5분 뒤 반영" 확인은 \`npm run build && npm run start\`로 한다` |
| ISR-2 | 66행 F011 설명 | 끝에 추가: `배포본에서는 재생성이 실패해도 이전 내용이 유지되므로, 오류 화면은 캐시가 없는 첫 렌더나 개발 환경에서 주로 보인다. 배포 전에 Vercel 환경변수(\`NOTION_API_KEY\`, \`NOTION_DATA_SOURCE_ID\`)를 먼저 등록한다` |
| ISR-3 | 111행 주요 기능 F010 줄 | `약 5분 주기(revalidate 300초)로 Notion을 다시 읽는 자동 갱신 (F010)` |
| ISR-4 | 47행 사용자 여정 | `(Notion에서 고친 내용은 약 5분 뒤 방문 시 자동 반영. 개발 서버에서는 즉시 반영)` |
| NOINDEX-1 | 67행 F012 설명·관련 페이지 | 설명: `루트 레이아웃(\`app/layout.tsx\`)의 \`metadata.robots = { index: false, follow: false }\`로 설정해 소품 목록 페이지뿐 아니라 남아 있는 스타터 킷 경로(\`/dashboard\` 등)와 404 화면까지 모든 경로를 덮는다`. 관련 페이지: `소품 목록 페이지 (루트 레이아웃에서 모든 경로에 적용)` |
| NOINDEX-2 | 96행 메뉴 구조 글머리 | 교체: `스타터 킷의 대시보드 틀(사이드바 + 상단 바)은 쓰지 않는다. \`lib/site.ts\`의 \`mainNav\`를 "홈" 하나로 줄이고, \`(dashboard)\` 경로는 삭제한다 (남겨 두더라도 색인 거부는 루트 레이아웃에서 걸리므로 노출되지 않는다)` |
| NOINDEX-3 | 111행 주요 기능 F012 줄 | `검색 엔진 색인 거부 메타 설정 — 루트 레이아웃에서 전체 경로에 적용 (F012)` |
| 기록 | 189~195행 정합성 검증 결과 | 끝에 추가: `- 2026-10-09 prd-validator 검증(\`2026-10-09-project-notion-cms-prd-validation.md\`) Major 4건 반영: 데이터 소스 ID, ISR revalidate 명시, noindex 루트 적용, 사이트 이름 Living Wishlist` |

금지 항목(API 라우트·인프라·개발 단계 등)은 추가하지 않는다. `revalidate`·`metadata.robots`는 페이지 설정값이고, 환경변수 이름은 데이터 모델의 조회 키 설명이므로 범위 안이다.

## 커밋 (plan 승인 후, `/ship` 절차)

- 브랜치: `docs/prd-living-wishlist`
- 올릴 파일: `docs/prd/2026-10-09-project-notion-cms-prd.md`, `docs/prd/2026-10-09-project-notion-cms-prd-validation.md`(수정 전 검증 기록), `plans/2026-10-09-project-notion-cms-interior-service-plan.md`(PRD가 기준 문서로 참조하므로 함께), `plans/2026-10-09-project-notion-cms-prd-agents-update-plan.md`(남은 작업 완료 표시), 이 계획 파일
- 커밋 메시지·PR 제목은 영어. 4단계 확인은 `/ship` 규칙대로 한 번 받는다. 병합(`gh pr merge`)은 이전처럼 권한 분류기가 막을 수 있으니 그때는 사용자가 `! gh pr merge <번호> --merge --delete-branch`를 직접 실행한다

## 검증 방법

- `grep -n "인테리어 소품 후보 모아보기" docs/prd/*-prd.md` → 결과 없음 (이름 완전 교체)
- `grep -n "Living Wishlist" docs/prd/*-prd.md` → 제목·핵심 정보·메뉴 구조 3곳 이상
- `grep -n "NOTION_DATABASE_ID" docs/prd/*-prd.md plans/*interior*.md` → 결과 없음, `NOTION_DATA_SOURCE_ID`가 PRD 2곳·기획 문서 1곳
- `grep -n "revalidate = 300\|app/layout.tsx" docs/prd/*-prd.md` → F010·F012 줄에 존재
- 코드 펜스 수 `grep -c '^```' docs/prd/*-prd.md` → 짝수(4) 유지
- 선택: `prd-validator`를 다시 돌려 Major가 0건으로 줄었는지 확인 (약 10분, 토큰 많이 쓰므로 사용자가 원할 때만)

## 진행 상태

- [x] PRD 편집 (15건 교체, 각 1회 일치 확인)
- [x] 기획 문서 41행 환경변수 이름
- [x] 이전 계획 파일 남은 작업 완료 표시
- [x] 계획 파일 이름 변경
- [ ] `/ship` 커밋·PR·병합
