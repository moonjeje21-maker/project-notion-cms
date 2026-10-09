# PRD 재생성(prd-generator) 및 기존 PRD 업데이트 계획

날짜: 2026-10-09 · 프로젝트: project-notion-cms

## 배경 (Context)

- 정식 설계도는 `docs/prd/2026-10-09-project-notion-cms-prd.md`다. 이 파일은 `prd-generator`가 처음 만든 뒤 `prd-validator`의 Major 4건을 손으로 보정해(보정 계획 15건 편집) PR #4로 병합한 상태다.
- 사용자 요청: 기획 문서 v4(`plans/2026-10-09-project-notion-cms-interior-service-plan.md`)와 보정 계획(`plans/2026-10-09-project-notion-cms-prd-living-wishlist-fix-plan.md`)을 입력으로 `prd-generator`를 **다시** 돌려 PRD를 쓰고, 그 결과를 기존 PRD에 반영한다.
- 목적: 손으로 덧댄 PRD가 아니라, 보정 내용이 처음부터 녹아든 PRD를 에이전트가 새로 쓰게 해서 기존 문서와 **비교**하고, 더 나은 표현·누락 보완을 기존 파일에 가져온다. 최종 파일 이름은 바꾸지 않는다 (CLAUDE.md가 이 경로를 설계도로 가리킨다).
- 사용자 결정 (2026-10-09): 입력은 계획 문서 2개만 · 생성 → 비교 → 반영을 차례로 진행 · `prd-validator` 재실행은 하지 않음.

## 지켜야 할 것

- **기존 PRD를 덮어쓰지 않는다.** `prd-generator`는 프로젝트명으로 파일 이름을 정하므로(`docs/prd/<날짜>-<프로젝트>-prd.md`), 프로젝트명을 그대로 주면 기존 파일을 덮어쓴다. 프롬프트에 저장 경로를 **`docs/prd/2026-10-09-living-wishlist-prd.md`**로 명시한다.
- 보정 계획이 반영한 Major 4건(데이터 소스 ID, `revalidate = 300`, 루트 레이아웃 `metadata.robots`, 사이트 이름 Living Wishlist)은 반영 뒤에도 남아 있어야 한다. 아래 검증 grep으로 확인한다.
- 에이전트 금지 항목(API 라우트·인프라·개발 단계·성능 지표 등)은 기존 PRD에도 추가하지 않는다. 기획 문서 7장 "구현 단계"·9장 "위험"은 PRD 범위 밖이므로 가져오지 않는다.
- `docs/prd/2026-10-09-project-notion-cms-prd-validation.md`(검증 기록)는 수정하지 않는다.
- 파일을 고치기 전까지(1단계·2단계) 기존 PRD는 읽기만 한다.

## 단계

### 1단계 · prd-generator 실행 (새 파일 생성)

`Agent(subagent_type: "prd-generator")`를 한 번 부른다. 프롬프트에 넣을 내용:

- 입력 문서 2개의 절대 경로 (기획 문서 v4, 보정 계획). 둘을 Read로 읽고, 기획 문서를 기준으로 쓰되 보정 계획의 "PRD 편집 내용" 표 15건과 Major 4건 요약은 **PRD 본문에 처음부터 반영**하라고 지시한다
- 사이트(프로젝트) 이름은 **Living Wishlist**. 제목은 `# Living Wishlist MVP PRD`
- 저장 경로는 **`docs/prd/2026-10-09-living-wishlist-prd.md`** 고정. `docs/prd/2026-10-09-project-notion-cms-prd.md`는 읽지도 덮어쓰지도 말라고 명시 (사용자 결정: 입력은 계획 문서 2개만)
- 기술 스택은 에이전트 정의대로 `package.json`·`README.md`에서 읽음. `@notionhq/client`는 "(설치 예정)"
- 결과 보고에 저장 경로를 첫 줄로 적게 한다 (에이전트 기본 동작)

확인: `ls docs/prd/`에 파일이 3개(기존 PRD · 검증 기록 · 새 PRD)이고, 기존 PRD의 `git diff`가 비어 있다.

### 2단계 · 비교 (읽기만)

새 PRD와 기존 PRD를 섹션별로 나란히 읽고 차이를 표로 정리해 사용자에게 보여 준다. 섹션 순서: 가정 → 핵심 정보 → 사용자 여정 → 기능 명세(F001~F012) → 메뉴 구조 → 페이지별 상세 → 데이터 모델 → 기술 스택 → 정합성 검증 결과.

차이는 세 종류로 분류한다:

| 분류 | 뜻 | 처리 |
|---|---|---|
| **가져옴** | 새 PRD가 더 정확하거나, 기존 PRD에 빠진 내용 (예: 기획 문서 "진행 상태"에 있는 Notion DB 생성 완료·선택지 6개 확정, 더 분명한 기능 설명) | 3단계에서 기존 PRD에 반영 |
| **유지** | 기존 PRD가 더 낫거나, 보정 Major 4건에 해당 | 그대로 둠 |
| **범위 밖** | 금지 항목이나 PRD에 넣지 않는 내용 | 무시 |

기능 ID 번호가 새 PRD에서 달라졌으면 **기존 번호(F001~F004, F010~F012)를 기준**으로 맞춘다. CLAUDE.md와 코드가 이 ID를 따른다.

비교 표를 보여 준 뒤 **가져올 항목에 대해 사용자 확인을 받고** 3단계로 간다 (사용자 요청: "순차적으로 비교해봐, 차례로 진행해").

### 3단계 · 기존 PRD에 반영

- `docs/prd/2026-10-09-project-notion-cms-prd.md`를 Edit로 항목별 교체 (각 교체 문자열은 파일에 1회만 일치하도록 잡는다)
- `## ✅ 정합성 검증 결과` 끝에 한 줄 추가: `- 2026-10-09 prd-generator 2차 생성본(계획 문서 2개 입력)과 비교해 N건 반영. 비교 기준과 목록은 plans/2026-10-09-project-notion-cms-prd-regenerate-plan.md`
- 3행 "기준 문서" 줄에 보정 계획 경로를 덧붙여 기준 문서가 2개임을 적는다
- 새 PRD 파일(`2026-10-09-living-wishlist-prd.md`)은 반영이 끝나면 **삭제**한다. 이유: `prd-validator`는 경로 없이 부르면 `docs/prd/*-prd.md` 중 최신 파일을 고르므로 PRD가 2개면 잘못 집는다. 비교 결과는 이 계획 파일에 남긴다

### 4단계 · 계획 파일 정리

- 이 파일을 `plans/2026-10-09-project-notion-cms-prd-regenerate-plan.md`로 이름을 바꾸고, 진행 상태와 2단계 비교 표(최종본)를 적는다
- `plans/2026-10-09-project-notion-cms-prd-living-wishlist-fix-plan.md` 진행 상태의 `[ ] /ship 커밋·PR·병합`을 `[x]`로 바꾼다 (git 기록 `91c37d2`, PR #4로 이미 병합됨)

### 5단계 · 올리기 (사용자가 `/ship` 호출)

`/ship`은 사용자만 부를 수 있다. 3·4단계가 끝나면 올릴 파일 목록과 변경 요약을 보여 주고 사용자가 `/ship`을 부르기를 기다린다.

- 브랜치 제안: `docs/prd-regenerate-merge`
- 올릴 파일: `docs/prd/2026-10-09-project-notion-cms-prd.md`, `plans/2026-10-09-project-notion-cms-prd-regenerate-plan.md`, `plans/2026-10-09-project-notion-cms-prd-living-wishlist-fix-plan.md`
- `.md`만 바뀌므로 lint·build는 건너뛴다 (ship 2단계 규칙)

## 검증 방법 (3단계 뒤)

```
grep -c "인테리어 소품 후보 모아보기" docs/prd/2026-10-09-project-notion-cms-prd.md   # 0
grep -c "Living Wishlist" docs/prd/2026-10-09-project-notion-cms-prd.md               # 3 이상
grep -n "NOTION_DATABASE_ID" docs/prd/*-prd.md                                         # 결과 없음
grep -n "NOTION_DATA_SOURCE_ID" docs/prd/2026-10-09-project-notion-cms-prd.md          # 2곳 이상
grep -n "revalidate = 300\|app/layout.tsx" docs/prd/2026-10-09-project-notion-cms-prd.md  # F010·F012 줄
grep -c '^```' docs/prd/2026-10-09-project-notion-cms-prd.md                           # 짝수(4)
grep -o "F0[0-9][0-9]" docs/prd/2026-10-09-project-notion-cms-prd.md | sort -u         # F001~F004, F010~F012 7개만
ls docs/prd/                                                                            # PRD 1개 + 검증 기록 1개
```

- 정합성: 기능 명세의 ID 7개가 모두 "소품 목록 페이지"의 구현 기능 목록과 메뉴 구조에 있는지 눈으로 확인
- 금지 항목(API 라우트·인프라·개발 단계·성능 지표·마일스톤·보안 요구사항·페르소나) 섹션이 생기지 않았는지 확인

## 진행 상태

- [ ] 1단계 prd-generator 실행 → `docs/prd/2026-10-09-living-wishlist-prd.md`
- [ ] 2단계 비교 표 작성 · 사용자 확인
- [ ] 3단계 기존 PRD 반영 · 새 파일 삭제 · 검증 grep
- [ ] 4단계 계획 파일 이름 변경 · 보정 계획 `/ship` 완료 표시
- [ ] 5단계 사용자 `/ship`

## 결과 (2026-10-09)

### 2단계 비교 결과 (최종)

새 PRD(`docs/prd/2026-10-09-living-wishlist-prd.md`, prd-generator 2차 생성본 · 약 3분, 도구 호출 6회)와 기존 PRD를 섹션별로 비교했다. 새 파일은 반영 뒤 삭제했다.

**가져옴 (11건, 사용자 승인 후 모두 반영)**

| # | 섹션 | 내용 |
|---|---|---|
| 1 | 가정 | 종류가 빈 소품이 있으면 "기타" 칩을 맨 끝에 둔다 (칩 순서는 기존 "처음 등장 순서" 유지) |
| 2 | 가정 | 카드 이미지는 정사각형 영역에 맞춰 자름(`object-cover`), 대체 그림도 같은 크기 |
| 3 | 가정 | 링크 없는 카드는 눌리지 않는 모양(기본 커서, 흐린 배지) |
| 4 | 사용자 여정 | 소품 0개면 칩도 숨김 · "자동 리디렉션 없음" 한 줄 |
| 5 | F002 | `rel="noopener noreferrer"` 명시 |
| 6 | F003 | 브라우저 필터 이유(서버 쿼리 필터 → 동적 페이지 → F010 캐시 무력화) |
| 7 | F011 | 실패 원인 예시 + `retry` prop |
| 8 | 메뉴 구조 | 머리글 구성(왼쪽 사이트 이름, 오른쪽 다크 모드 버튼만) |
| 9 | 페이지 상세 | 선택된 칩 강조 |
| 10 | 데이터 모델 | 모델 제목 "인테리어 소품" → "Living Wishlist (2026-10-09 생성 완료)", Item 관계 열도 교체 |
| 11 | 데이터 모델 | 조회 키에 `NOTION_API_KEY`·`.env.local`(git 미추적) 명시 |

**유지**: 칩 순서(새 PRD의 "Notion 선택지 순서"는 데이터 소스 스키마 조회가 추가로 필요해 복잡) · F010에 조회 방식 중복 기재(기존은 데이터 모델 "조회 키" 한 곳) · 기술 스택 구조(기존의 "이미지" 소제목 유지) · 보정 Major 4건 전부 · F004 `onError` 등 구현 표현

**범위 밖**: 페이지 상세의 "구성 메모"(파일 경로·컴포넌트 배치는 CLAUDE.md 구조 규칙과 기획 문서 7장이 담당) · `"use client"` 배치

### 검증 결과

옛 이름 0회 · "Living Wishlist" 12회 · `NOTION_DATABASE_ID` 없음 · `NOTION_DATA_SOURCE_ID` 2곳(F011, 조회 키) · `revalidate = 300`/`app/layout.tsx` F010·F012 줄 · 코드 펜스 4개 · 기능 ID 7개(F001~F004, F010~F012)만 · 금지 섹션 없음 · `docs/prd/`에 PRD 1개 + 검증 기록 1개

### 진행 상태 (최종)

- [x] 1단계 prd-generator 실행
- [x] 2단계 비교 표 작성 · 사용자 확인 ("11건 모두 반영")
- [x] 3단계 기존 PRD 반영(13건 교체) · 새 파일 삭제 · 검증 grep 통과
- [x] 4단계 계획 파일 이름 변경 · 보정 계획 `/ship` 완료 표시
- [ ] 5단계 사용자 `/ship` (브랜치 `docs/prd-regenerate-merge`)
