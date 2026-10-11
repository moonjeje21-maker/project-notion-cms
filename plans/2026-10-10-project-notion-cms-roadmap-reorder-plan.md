# 로드맵 순서 변경 계획: Notion 연결 준비를 화면 작업 앞으로

## Context

프로젝트에서 가장 불확실한 부분은 Notion 연결이다(열 타입이 URL 속성인지, 데이터 소스 ID 방식, SDK 5.x 호출 방식 등 로드맵 가정 절의 검증 안 된 가정). 이 불확실성을 화면 작업 전에 작게 확인하기 위해, "Notion SDK 설치와 연결 준비하기"(현재 Task 005)를 Task 002로 앞당긴다. 이 Task는 `page.tsx`를 건드리지 않고 터미널에서 행 개수만 확인하므로 화면 Task들과 충돌하지 않는다. 실제 데이터 연결은 원래대로 Task 006에서 한다.

## 번호 이동 (Task 006~008과 가정 절의 "Task 006" 참조는 그대로)

| 현재 | 변경 후 | 내용 |
|---|---|---|
| 005 | **002** | Notion SDK 설치와 연결 준비하기 → **Phase 1(뼈대)로 이동** (설치·환경변수·원시 조회는 구조 작업) |
| 002 | 003 | 기본 소품 카드와 카드 그리드 만들기 |
| 003 | 004 | 카드의 예외 상태 만들기 |
| 004 | 005 | 종류 칩 필터와 빈 상태 만들기 |

## 고칠 파일

### `docs/roadmap/ROADMAP.md` (직접 Edit, 이전과 같은 이유로 `git diff`로 검증)

1. `### Phase 1: 뼈대 (구조) ✅` → `✅` 제거 (미완료 Task가 생김)
2. 현재 Task 005 블록 전체를 Phase 1의 Task 001 뒤로 옮기고 번호를 **Task 002**, 제목 줄 끝에 `- 우선순위`
3. Phase 2의 Task 002→003 (`- 우선순위` 제거), 003→004, 004→005. 옛 Task 002 본문의 "대체 그림·링크 처리는 Task 003" → Task 004
4. Phase 3 제목 아래는 Task 006·007만 남음
5. `## 📌 가정`에 한 줄 추가: **Notion 연결 검증 시점** — 가장 불확실한 외부 연동을 화면보다 먼저 확인하기 위해 SDK 설치·환경변수·원시 조회(Task 002)를 Phase 1에 둔다. 화면 Task는 더미 데이터를 그대로 쓰고, 실제 데이터 연결은 Task 006
6. 대조표: F001 `Task 003, Task 006` · F002 `Task 004` · F003 `Task 005` · F004 `Task 004, Task 005` · F010 그대로 · F011 `Task 002, Task 006, Task 007, Task 008`
7. 기반 Task 줄: `Task 005(SDK 설치…)` → `Task 002(SDK 설치…)`

### `docs/roadmap/tasks/001-item-type-and-dummy-data.md`

- 변경 요약 마지막 줄 "다음은 Task 002(기본 카드·그리드)" → "다음은 Task 002(Notion SDK 설치·연결 준비)"

### 손대지 않는 것

- `src/lib/mock-items.ts` 주석과 작업 파일 001의 "Task 006" 참조 (번호 그대로)
- `plans/2026-10-10-project-notion-cms-task-001-plan.md` (당시 기록)

## 검증

1. `git diff docs/roadmap/ROADMAP.md`로 계획한 부분만 바뀌었는지 확인
2. `grep -n "Task 00[0-9]" docs/roadmap/ROADMAP.md`로 000~008 연속, 우선순위가 Task 002 하나뿐, 대조표 F ID 6개 확인
3. 계획 파일을 `plans/2026-10-10-project-notion-cms-roadmap-reorder-plan.md`로 옮기고 완료 상태 추가
4. 이어서 `/ship` (Task 001 변경과 이 로드맵 변경을 한 PR로)

## 완료 상태 (2026-10-10)

- ✅ `docs/roadmap/ROADMAP.md`: Notion 연결 준비를 Task 002로 Phase 1에 옮기고 우선순위 부여, 화면 Task 003~005로 번호 이동, 가정 한 줄 추가, 대조표·기반 Task 줄 갱신, Phase 1 완료 표시 제거
- ✅ `docs/roadmap/tasks/001-item-type-and-dummy-data.md`의 "다음" 안내를 Task 002(Notion SDK 설치·연결 준비)로
- ✅ Task 000~008 연속, 우선순위 Task 002 하나, 대조표 F ID 6개 확인
- 커밋은 `/ship`으로 (Task 001 변경과 함께 한 PR)

## 남은 작업

- 없음. 다음은 "Task 002 작업 파일 만들어줘" (사용자가 Notion API 키·데이터 소스 ID를 준비한 뒤)
