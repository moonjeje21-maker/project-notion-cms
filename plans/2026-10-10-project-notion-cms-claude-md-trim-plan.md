# CLAUDE.md 다듬기 계획

작성일: 2026-10-10 · 기준: Claude Code 공식 Best practices 문서의 "Write an effective CLAUDE.md" 절

## 배경

- `# Project Context` 섹션에 `@docs/prd/prd.md`·`@docs/roadmap/ROADMAP.md`를 넣자 매 세션 로드량이 약 3.4천 자에서 약 2만 자로 늘었다. 가이드는 "자세한 문서는 링크로, 자주 바뀌는 정보는 제외"라고 한다
- "진행 중인 작업" 섹션에 날짜가 든 상태 문장이 있어 금방 낡는다 (상태는 ROADMAP이 담당)

## 단계

1. `@` 가져오기 제거: PRD·ROADMAP은 경로만 적고 필요할 때 읽는다. 맨 끝 `# Project Context` 섹션은 경로를 본문 섹션에 합치고 지운다
2. "진행 중인 작업" → "프로젝트 문서"로 바꾸고 상태 문장(스타터 정리 날짜, Notion 미연동, 자리 표시 문구)을 뺀다. 남기는 것: 무엇을 만드는지, PRD·ROADMAP 경로, PRD에서 정한 구현 방식 3가지, 문서 에이전트 순서와 파일 이름 규칙
3. `/doctor`는 대화형 명령이라 사용자가 직접 실행한다

## 검증

- `wc -m CLAUDE.md`로 크기 확인, `grep '^@' CLAUDE.md`로 남은 가져오기가 `@AGENTS.md`뿐인지 확인
- 다음 세션에서 `/context`로 로드량 확인

## 상태

- [x] 1단계 · [x] 2단계 · [x] 3단계: `/doctor` 실행 결과 유추 가능한 2줄(기술 스택 문장, 문서 에이전트 항목) 삭제. CLAUDE.md 2,964자 → 2,597자
- 남은 일: `docs/roadmap/ROADMAP.md` Task 005가 가리키는 "진행 중인 작업" 문장은 이제 없으므로, Task 005 때 그 항목을 "프로젝트 문서 섹션 확인"으로 바꾼다
