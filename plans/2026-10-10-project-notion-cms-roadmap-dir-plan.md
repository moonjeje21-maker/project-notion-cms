# 로드맵·Task 파일을 docs/roadmap/ 아래로 옮기는 계획

작성일: 2026-10-10 · 대상: `ROADMAP.md`, `tasks/`, `.claude/agents/development-planner.md`, `CLAUDE.md`

## 배경 (Context)

`development-planner` 에이전트가 2026-10-10에 저장소 루트에 `ROADMAP.md`와 `tasks/000-sample.md`를 만들었다 (둘 다 커밋 전). 사용자가 기획 문서를 한곳에 모으기 위해 **`docs/roadmap/ROADMAP.md` + `docs/roadmap/tasks/`** 구조를 제안했고, 검토 결과 동의했다: 이미 있는 `docs/prd/`와 나란히 놓여 PRD → 로드맵 → Task 흐름이 폴더에서 읽히고, 루트가 깔끔해지며, 커밋 전이라 이동 비용이 가장 낮다. `plans/`는 홈 CLAUDE.md 규칙(프로젝트 바로 아래)이라 옮기지 않는다.

같은 시점에 사용자가 세션 밖에서 PRD를 `docs/prd/2026-10-09-project-notion-cms-prd.md` → `docs/prd/prd.md`로 바꾸고(내용 동일, `diff`로 확인) `-validation.md`를 지웠다. 이로 인해 `CLAUDE.md`·`ROADMAP.md`·에이전트의 PRD 경로 참조가 깨졌으므로 이 계획에서 함께 고친다. **가정**: PRD 이름 변경은 의도된 것이다.

## 바뀌는 구조

```
docs/
├─ prd/
│  └─ prd.md                      (사용자가 이미 변경)
└─ roadmap/
   ├─ ROADMAP.md                  (루트에서 이동)
   └─ tasks/
      └─ 000-sample.md            (tasks/에서 이동, 루트 tasks/ 삭제)
```

경로 표기는 모든 문서에서 **저장소 기준 경로**(`docs/roadmap/tasks/001-....md`)로 통일한다. 에이전트가 Grep·Read로 찾을 때 모호하지 않기 때문이다.

## 작업

### 1. 파일 이동 (git 미추적 파일이라 `mv`)

```bash
mkdir -p docs/roadmap/tasks
mv ROADMAP.md docs/roadmap/ROADMAP.md
mv tasks/000-sample.md docs/roadmap/tasks/000-sample.md
rmdir tasks
```

### 2. `.claude/agents/development-planner.md` 경로 수정 (Edit, 내용은 그대로)

| 위치 | 지금 | 바꾼 뒤 |
|---|---|---|
| 3행 description | `Korean ROADMAP.md (and tasks/ files)` … `latest PRD in docs/prd/` | `docs/roadmap/ROADMAP.md (and docs/roadmap/tasks/ files)` … `the PRD in docs/prd/` |
| 9행 역할 문장 | `` `ROADMAP.md`와 `tasks/` 파일 `` | `` `docs/roadmap/ROADMAP.md`와 `docs/roadmap/tasks/` 파일 `` |
| 16행 PRD 읽기 | `docs/prd/`에서 날짜가 가장 최신인 `*-prd.md` | `docs/prd/prd.md`. 없으면 `docs/prd/`에서 날짜가 가장 최신인 `*-prd.md` (`-validation.md` 제외) |
| 18행 모드 판정 | `` `ROADMAP.md`와 `tasks/` `` | `` `docs/roadmap/ROADMAP.md`와 `docs/roadmap/tasks/` `` |
| 22행 생성 모드 | 저장소 루트에 `ROADMAP.md`를 쓰고, `tasks/000-sample.md` | `docs/roadmap/ROADMAP.md`를 쓰고(폴더가 없으면 Write가 함께 만듭니다), `docs/roadmap/tasks/000-sample.md` |
| 24행 Task 파일 생성 | `tasks/000-sample.md` … `tasks/XXX-설명.md` … `See: tasks/XXX-설명.md` | 모두 `docs/roadmap/tasks/…` |
| 26행 출력 범위 | `` (`ROADMAP.md`, `tasks/*.md`) `` | `` (`docs/roadmap/ROADMAP.md`, `docs/roadmap/tasks/*.md`) `` |
| 80행 절 제목 | `## 📄 ROADMAP.md 형식 (저장소 루트)` | `## 📄 ROADMAP.md 형식 (docs/roadmap/ROADMAP.md)` |
| 103·104행 워크플로우(템플릿) | `tasks/XXX-설명.md`, `tasks/000-sample.md` | `docs/roadmap/tasks/…` |
| 146행 상태 규칙 | `See: tasks/XXX-설명.md` | `See: docs/roadmap/tasks/XXX-설명.md` |
| 150행 절 제목 | `## 📁 tasks/ 폴더 규칙` | `## 📁 docs/roadmap/tasks/ 폴더 규칙` |
| 153행 샘플 설명 | `tasks/000-sample.md` | `docs/roadmap/tasks/000-sample.md` |
| 211행 보고 형식 | `ROADMAP.md / tasks/000-sample.md / tasks/XXX-....md` | `docs/roadmap/ROADMAP.md / docs/roadmap/tasks/000-sample.md / docs/roadmap/tasks/XXX-....md` |

27·35·205행처럼 파일 이름만 부르는 `ROADMAP.md`는 그대로 둔다 (위치는 22행이 정한다).

### 3. `CLAUDE.md` 두 줄 수정

- 16행: 설계도 경로 `docs/prd/2026-10-09-project-notion-cms-prd.md` → `docs/prd/prd.md`
- 20행: "결과는 루트 `ROADMAP.md`와 `tasks/` (Task 상세 파일, 형식은 `tasks/000-sample.md`)" → "결과는 `docs/roadmap/ROADMAP.md`와 `docs/roadmap/tasks/` (Task 상세 파일, 형식은 `docs/roadmap/tasks/000-sample.md`)"

19행(PRD 에이전트가 `docs/prd/`에 날짜 이름으로 저장)은 그대로 둔다. `prd-generator`·`prd-validator`의 저장 규칙 자체는 이 계획의 범위 밖이다 (아래 "남는 일" 참조).

### 4. `docs/roadmap/ROADMAP.md` 세 줄 수정

- 5행: 기준 PRD 경로 → `docs/prd/prd.md`
- 32행: `tasks/XXX-설명.md` … `tasks/000-sample.md` → `docs/roadmap/tasks/…`
- 33행: `tasks/XXX-설명.md` → `docs/roadmap/tasks/XXX-설명.md`

Task 000의 `See: plans/...`는 그대로.

### 5. 계획 파일 저장

이 파일을 `plans/2026-10-10-project-notion-cms-roadmap-dir-plan.md`로 이름을 바꾸고, 완료 후 완료 상태를 적는다.

## 검증

```bash
ls docs/roadmap docs/roadmap/tasks          # ROADMAP.md, 000-sample.md
test ! -e ROADMAP.md && test ! -e tasks     # 루트에 남은 것 없음
grep -rn "tasks/" .claude/agents/development-planner.md CLAUDE.md docs/roadmap/ROADMAP.md | grep -v "docs/roadmap/tasks/"   # 0건
grep -rn "2026-10-09-project-notion-cms-prd\.md" CLAUDE.md docs/roadmap/ROADMAP.md .claude/agents/development-planner.md   # 0건
grep -n "저장소 루트" .claude/agents/development-planner.md   # 0건
```

코드 변경이 없으므로 lint·build는 돌리지 않는다.

## 남는 일 (이 계획 범위 밖, 사용자 판단)

- `prd-generator`는 `docs/prd/<날짜>-<프로젝트>-prd.md`로 저장하고 `prd-validator`는 `<이름>-validation.md`를 만든다. PRD를 `prd.md` 하나로 두기로 했다면 두 에이전트와 `CLAUDE.md` 19행의 저장 규칙도 맞춰야 한다
- `plans/` 안의 옛 계획 파일들에 남은 옛 PRD 경로는 기록이므로 고치지 않는다
- 커밋: `/ship`. 올릴 파일은 `docs/roadmap/` 2개, 에이전트 파일, `CLAUDE.md`, 이 계획 파일, 그리고 사용자가 바꾼 PRD 이동(삭제 2 + 추가 1)이다. PRD 변경을 같은 PR에 넣을지는 `/ship` 때 사용자가 정한다

## 완료 상태 (2026-10-10)

### 완료한 항목

- `ROADMAP.md` → `docs/roadmap/ROADMAP.md`, `tasks/000-sample.md` → `docs/roadmap/tasks/000-sample.md` 이동, 루트 `tasks/` 삭제
- `.claude/agents/development-planner.md`: `tasks/` → `docs/roadmap/tasks/`, 저장 위치 `docs/roadmap/ROADMAP.md`, PRD 읽기 순서를 `docs/prd/prd.md` 우선으로 (프런트매터 예시의 PRD 경로 포함)
- `CLAUDE.md` 16행(설계도 경로 `docs/prd/prd.md`)·20행(로드맵·tasks 경로) 수정
- `docs/roadmap/ROADMAP.md` 기준 PRD 경로와 워크플로우의 tasks 경로 수정

### 검증 결과

- 루트에 `ROADMAP.md`·`tasks/` 없음. 세 문서에서 접두어 없는 `tasks/` 0건, 이중 접두어 0건, 옛 PRD 경로 0건, "저장소 루트" 0건
- 코드 변경 없음 → lint·build 생략

### 남은 작업

- `/ship`으로 커밋. 사용자가 세션 밖에서 바꾼 PRD 이동(`docs/prd/prd.md` 추가, 옛 PRD·검증 파일 삭제)을 같은 PR에 넣을지 그때 정한다
- `prd-generator`·`prd-validator`의 저장 이름 규칙(날짜 이름, `-validation.md`)을 `prd.md` 단일 파일 방식에 맞출지는 별도 결정
