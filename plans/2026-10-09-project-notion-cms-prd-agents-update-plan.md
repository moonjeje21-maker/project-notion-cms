# PRD 에이전트 정의 파일 정비 계획

날짜: 2026-10-09 · 프로젝트: project-notion-cms

## 배경 (Context)

`.claude/agents/prd-generator.md`와 `.claude/agents/prd-validator.md`는 1인 개발자용 PRD(제품 요구사항 문서)를 만들고 검증하는 서브에이전트 정의다. 둘 다 등록은 되어 있어 부를 수 있지만, 내용에 다음 문제가 있어 이 프로젝트에서 그대로 쓰면 결과가 어긋난다.

- "현재 최신"으로 Next.js 15, TypeScript 5.6을 박아 두었는데 이 저장소는 Next.js 16.3.8, React 19.3이다. 백엔드도 Supabase/Vercel로 고정했는데 이 프로젝트는 Notion API를 데이터 저장소로 쓴다 (`plans/2026-10-09-project-notion-cms-interior-service-plan.md` 3장).
- 생성기 템플릿의 코드 펜스가 중첩되어 마크다운이 중간에 끊긴다.
- 생성기 규칙과 템플릿이 서로 어긋난다 (알림·설정 메뉴, 데이터 모델 타입 열, 2페이지 제한, 인증 강제).
- 생성기는 보안·성능·일정을 금지하는데 검증기는 그것을 평가해서 항상 "누락" 지적이 나온다.
- 검증기에는 프롬프트를 고친 사람의 변경 메모("NEW!", "개선 포인트 요약")와 사람용 사용법이 섞여 있다.
- 두 파일 모두 입력·출력 경로, 도구 제한이 없다.

사용자 결정: 제안 전부 반영, 두 파일의 `model`은 fable 계열로 지정한다. 같은 폴더의 `code-reviewer.md`가 `model: claude-fable-5-1`을 쓰므로 같은 표기를 따른다.

## 바꾸는 파일

1. `.claude/agents/prd-generator.md` (전체 다시 쓰기)
2. `.claude/agents/prd-validator.md` (전체 다시 쓰기)
3. 이 계획 파일을 `plans/2026-10-09-project-notion-cms-prd-agents-update-plan.md`로 이름 바꾸기 (CLAUDE.md 규칙)

새 폴더 `docs/prd/`는 지금 만들지 않는다. 에이전트가 PRD를 저장할 때 없으면 만든다.

## 1. prd-generator.md

### 프런트매터
```yaml
name: prd-generator
description: (기존 설명 유지 + 끝에 추가) PRD 파일 경로를 결과로 돌려주며, 작성 뒤에는 prd-validator로 검증하도록 안내한다.
tools: Read, Glob, Grep, Write, WebFetch, WebSearch
model: claude-fable-5-1
```

### 본문 변경 사항

| # | 위치 | 변경 |
|---|---|---|
| 1 | "기술 스택" 섹션, "기술 스택 선택 원칙", "중요 주의사항" | 버전 숫자(Next.js 15, React 19, TypeScript 5.6+)를 모두 지운다. 규칙을 "프로젝트에 `package.json`·`README.md`가 있으면 거기 적힌 스택과 버전을 그대로 쓴다. 없을 때만 `.claude/rules/library-docs.md` 순서로 공식 문서에서 최신 버전을 확인한다"로 교체. Supabase/Vercel 스택은 "프로젝트에 스택이 없을 때의 예시"로 격하하고, 템플릿의 스택 섹션은 `[프로젝트 package.json 기준으로 채움]` 자리표시자로 바꾼다 |
| 2 | 출력 템플릿 (현재 90~266행) | 바깥 펜스를 ```` ```` ```` (백틱 4개)로 바꿔 안쪽의 ```` ``` ```` 블록이 바깥을 닫지 않게 한다 |
| 3a | 템플릿 "공통 메뉴" | 메시지(F012)·알림(F013)·설정 항목 삭제. 로그아웃만 남기고, 인증이 없는 프로젝트면 공통 메뉴 블록 자체를 생략한다고 주석 |
| 3b | "6. 데이터 모델" 규칙 + 템플릿 표 | 규칙을 "필드명과 관계(어떤 모델을 가리키는지)만 쓰고 타입은 쓰지 않는다"로 통일. 템플릿 표 열을 `필드 / 설명 / 관계`로 바꾸고 `UUID`, `[타입]` 예시 삭제 |
| 3c | "작성 가이드라인 5. 최대 2페이지" | 삭제. 대신 "MVP 핵심 기능은 10개 이내, 페이지는 8개 이내"처럼 범위로 제한 |
| 4 | "3. 기능 명세" 중 "최소한의 인증 기능만 포함" | "사용자별로 저장되는 데이터가 있을 때만 최소 인증(회원가입/로그인)을 넣는다. 공개 조회 사이트처럼 필요 없으면 넣지 않는다"로 변경. 템플릿 F010 행에도 `(필요한 경우만)` 표기 |
| 5 | 새 섹션 "입력과 출력" (시스템 목표 바로 아래) | 입력: 프롬프트로 받은 아이디어 또는 기획 문서 경로(있으면 Read로 읽는다). 출력: `docs/prd/날짜-프로젝트-prd.md`로 저장(폴더 없으면 만든다). 날짜는 오늘 날짜, 프로젝트명은 저장소 폴더명 또는 사용자가 준 이름. 저장한 경로를 결과 첫 줄에 적는다 |
| 6 | 같은 "입력과 출력" 섹션 | "서브에이전트는 사용자에게 질문할 수 없다. 정보가 부족하면 합리적인 가정으로 채우고 문서 맨 위 `## 가정` 섹션에 항목으로 적는다" 추가. 템플릿에도 `## 가정` 섹션 추가 |
| 7 | 프런트매터 | 위 참고 |
| 8 | 마지막 문단 | "저장 후 결과 보고에 `prd-validator 에이전트로 docs/prd/<파일>을 검증하세요`라는 다음 단계 안내를 넣는다" 추가 |
| 기타 | 전체 | 이모지·굵은 글씨 과다 사용은 유지해도 되나, 정합성 체크리스트는 그대로 둔다 (핵심 가치). "처리 프로세스" 8번의 "최신 버전의" 표현을 "프로젝트 기준의"로 바꾼다 |

## 2. prd-validator.md

### 프런트매터
```yaml
name: prd-validator
description: (기존 설명 유지 + 추가) PRD 파일 경로를 받아 읽는다. 결과는 같은 폴더에 `-validation.md`를 붙여 저장한다. 사용 예: "docs/prd/xxx-prd.md를 검증해줘"
tools: Read, Glob, Grep, Write, WebFetch, WebSearch
model: claude-fable-5-1
color: red
```

### 본문 변경 사항

| # | 위치 | 변경 |
|---|---|---|
| 1 | "📝 사용법 가이드", "🔑 핵심 개선 포인트 요약", "📈 개선된 검증 품질 보장", 마지막 문장 "이제 PRD 검증 시 이 개선된 프롬프트를…" | 모두 삭제. 제목의 "(NEW!)" 표기 삭제 (Step 0, Step 2.5, 필수 검증 체크리스트) |
| 2 | 새 섹션 "검증 범위 (MVP PRD 기준)" (환각 방지 원칙 앞) | "prd-generator가 만든 MVP PRD에는 보안 요구사항·성능 지표·개발 일정·API 라우트·인프라 섹션이 의도적으로 없다. 이것을 누락으로 지적하지 않는다. 대신 선택한 기술과 데이터 모델이 나중에 그것을 막는지만 본다." Step 4의 "보안 구현 난이도"는 "기술 선택이 보안에 미치는 영향"으로, "시간 추정 연쇄 / 3-6개월 범위"는 "상대 복잡도(상·중·하)"로 바꾼다. 결과 템플릿 Major Issues의 "[보안/성능 문제]" 예시를 "[설계 위험]"으로 바꾼다 |
| 3 | 새 섹션 "입력과 출력" (CoT 활성화 앞) | 입력: 프롬프트에 적힌 PRD 파일 경로를 Read로 읽는다. 경로가 없으면 `docs/prd/`에서 가장 최근 `*-prd.md`를 Glob으로 찾고, 그것도 없으면 "검증할 PRD 경로가 필요하다"고 보고하고 끝낸다. 출력: 입력 파일과 같은 폴더에 `<원본이름>-validation.md`로 저장하고 경로를 결과 첫 줄에 적는다. 사용자에게 질문할 수 없으므로 불확실한 것은 [UNCERTAIN]으로 남긴다 |
| 4a | 태깅 예시 "[FACT] Next.js 15는 Server Actions를 지원함" | "[FACT] 프로젝트의 Next.js 버전(package.json 기준)이 Server Actions를 지원함 (node_modules/next/dist/docs/ 확인)"으로 변경 |
| 4b | "📚 공식 문서 확인 의무화" | 첫 항목을 "`.claude/rules/library-docs.md`를 먼저 읽고 그 순서(설치된 코드 → homepage → 공식 사이트)를 따른다. 프로젝트 안에 설치된 라이브러리는 `node_modules`의 타입 정의와 README를 WebFetch보다 우선한다"로 교체. 나머지 항목(GitHub 예제, 릴리스 노트)은 유지 |
| 5 | 결과 템플릿 "기술적 확신도 분포 ___%", "신뢰도 및 위험도 ___/10" | 퍼센트 분포는 삭제하고 "[FACT] n건 / [INFERENCE] n건 / [UNCERTAIN] n건"으로 태그 개수만 적게 한다. `/10` 점수 4개는 유지하되 "각 점수 옆에 근거 한 줄 필수" 규칙 추가 |
| 6 | 프런트매터 `tools` | 위 참고 (Bash·Edit 제외) |
| 기타 | "Step 0" 기록 형식 [VERIFIED]/[ALTERNATIVE]/[LIMITATION]과 본문 태그 [FACT]/[INFERENCE]/[UNCERTAIN]/[ASSUMPTION] | 두 체계가 겹치므로 [VERIFIED]는 [FACT]로 합치고, [ALTERNATIVE]·[LIMITATION]은 보조 태그로 유지한다고 한 줄 명시 |

## 작업 순서

1. `prd-generator.md`를 위 표대로 전체 다시 쓴다 (Write).
2. `prd-validator.md`를 위 표대로 전체 다시 쓴다 (Write).
3. 이 계획 파일을 `plans/2026-10-09-project-notion-cms-prd-agents-update-plan.md`로 이름 바꾸고 아래 "진행 상태"를 채운다.

## 검증 방법

- 두 파일의 프런트매터가 `---`로 올바르게 닫히고 `name`, `description`, `tools`, `model` 키가 있는지 눈으로 확인한다.
- 생성기 템플릿을 마크다운 미리보기(또는 `grep -c '^````'`로 4-백틱 펜스가 짝수 개인지)로 확인해 중첩 펜스가 끊기지 않는지 본다.
- 버전 숫자가 남아 있지 않은지: `grep -n "Next.js 15\|5\.6" .claude/agents/prd-*.md` 결과가 비어야 한다.
- 새 세션에서 에이전트 목록에 두 에이전트가 바뀐 설명으로 나타나는지 확인한다 (프런트매터 파싱 오류가 있으면 목록에서 빠진다).
- 실제 동작 확인은 선택: `plans/2026-10-09-project-notion-cms-interior-service-plan.md`를 입력으로 `prd-generator`를 한 번 돌려 `docs/prd/`에 파일이 생기고 스택이 Next.js 16 / Notion API로 나오는지 본다. 이어서 `prd-validator`로 검증해 보안 누락 지적이 나오지 않는지 본다.

## 진행 상태 (2026-10-09 완료)

- [x] prd-generator.md 다시 쓰기
- [x] prd-validator.md 다시 쓰기
- [x] 계획 파일 이름 변경

확인한 것: 두 파일에 Next.js 15·TypeScript 5.6 표기 없음, 4-백틱 펜스 짝 맞음, 프런트매터 정상 닫힘.

남은 작업 (선택):

- 새 세션에서 에이전트 목록에 두 에이전트가 바뀐 설명으로 뜨는지 확인 (프런트매터 파싱 오류가 있으면 목록에서 빠진다)
- `plans/2026-10-09-project-notion-cms-interior-service-plan.md`를 입력으로 `prd-generator`를 돌려 `docs/prd/`에 저장되고 스택이 Next.js 16 / Notion API로 나오는지 확인한 뒤 `prd-validator`로 검증
- 변경 사항 커밋은 `/ship`으로 (main 직접 커밋 금지)

## 테스트 결과 (2026-10-09)

### 1차: prd-generator
- 입력: `plans/2026-10-09-project-notion-cms-interior-service-plan.md`
- 결과: `docs/prd/2026-10-09-project-notion-cms-prd.md` 생성 (폴더 새로 만듦)
- 점검: 가정 섹션 7개, 금지 항목 없음, URL 경로 없음, 인증 없음(기획대로), 버전이 `package.json`과 일치(Next.js 16.3.8 등), 미설치 라이브러리 "(설치 예정)" 표기, 코드 펜스 짝 맞음 → 통과

### 2차: prd-validator (실패 → 수정)
- 처음 두 번은 시작 직후 API 오류로 종료: "Fable 5.1's safeguards flagged this message … `[reasoning_extraction]`"
- 원인: 프롬프트가 `<thinking>`·`<thought-process>`·`<reflection>`·`<reasoning>` 태그 안에 "사고 과정을 기록"하라고 요구하고 "Let's think step by step", "Chain of Thought"를 반복. Fable 5.1은 모델 사고 과정을 꺼내 쓰라는 요청을 안전장치로 막는다
- 사용자 결정: 모델은 fable 유지, 프롬프트에서 사고 과정 노출 요구만 제거
- 조치: 태그와 해당 표현을 모두 빼고 같은 내용을 **관찰 → 근거 → 결론** 항목 형식으로 재작성. 단계(Step 0~5), 태그 체계, 검증 범위, 체크리스트, 결과 템플릿 구조는 유지. "자기 검증 루프"는 "마무리 점검" 목록으로 교체
- 교훈: `model: claude-fable-5-1`인 에이전트 정의에는 `<thinking>` 류 태그나 "사고 과정을 적어라"는 지시를 넣지 않는다

### 3차: 원인 재분석 (thinking 태그 제거만으로는 부족)
- 태그를 뺀 뒤에도 같은 오류. 본문을 세 덩어리로 나눠 사용자 메시지로 보내면 모두 통과, 정의 파일을 시스템 프롬프트로 올려 "한 줄만 답하라"고 하면 통과, PRD·규칙 파일 읽기와 Notion 공식 문서 WebFetch도 통과, 웹 없이 Step 0·3만 수행하는 축소 실행도 통과(품질 양호)
- 실패 기록 분석: 세 번 모두 도구 호출 0건, 첫 응답에서 분류기가 중단. 거부 사유 "reasoning_extraction — 모델 출력을 복제·역설계하는 것으로 보임"
- 결론: "검증해줘"처럼 짧은 요청에 모델이 첫 응답으로 지시문의 단계·체크리스트를 길게 되풀이해 적기 시작했고, 분류기가 이를 시스템 프롬프트 복제로 판단. 축소 실행은 첫 응답이 바로 Read 호출이어서 통과
- 조치: 정의 파일 맨 앞에 "🚀 시작 방법" 섹션 추가 — 첫 응답은 Read 호출로 시작, 지시문의 단계·체크리스트·템플릿을 답변에 옮겨 적지 않음, 자리표시자 설명문을 베끼지 않음, 중간 보고 없이 저장 후 한 번만 보고
- 교훈(수정): fable 모델 에이전트는 (1) `<thinking>` 류 사고 과정 기록 요구를 넣지 않고, (2) 긴 절차·템플릿을 가진 정의에는 "설명 없이 도구 호출로 시작하라"를 명시해 첫 응답이 지시문 되풀이가 되지 않게 한다

### 4차: prd-validator 전체 실행 성공 (시작 방법 섹션 추가 후)
- 요청: "docs/prd/2026-10-09-project-notion-cms-prd.md를 검증해줘" (짧은 실사용 형태)
- 결과: `docs/prd/2026-10-09-project-notion-cms-prd-validation.md` 저장. 판정 ⚠️ 조건부 통과, Critical 0 · Major 4 · Minor 4. 도구 호출 49회, 약 11분
- 점검: 관찰·근거·결론 각 15쌍, 자리표시자 베끼기 없음, 보안·성능·일정 누락 지적 없음, 절대 시간 추정 없음, `/10` 점수 4개 모두 근거 한 줄 포함, 버전을 node_modules 실제 설치본과 대조, Next.js 문서는 `node_modules/next/dist/docs/` 우선 사용
- Major 4건은 모두 PRD 문장 보완으로 해결 가능 (데이터 소스 ID, ISR revalidate 명시, noindex 적용 위치, 사이트 이름 "Living Wishlist" 불일치)

### 최종 상태
- [x] prd-generator: 동작 확인 완료
- [x] prd-validator: 동작 확인 완료 (fable 유지)
- [x] 커밋 범위 결정: 에이전트 2개 + 이 계획 파일만 `/ship` 절차로 올린다. `docs/prd/` 두 파일과 인테리어 기획 문서는 미추적 상태로 남겨 두고 나중에 따로 처리한다

남은 작업:
- PRD의 사이트 이름을 기획 문서의 "Living Wishlist"에 맞추고, 검증 결과의 Major 4건(데이터 소스 ID, ISR revalidate 명시, noindex 적용 위치)을 PRD에 반영한 뒤 `docs/prd/` 커밋 여부 결정
