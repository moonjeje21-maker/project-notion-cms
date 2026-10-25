# Task 007 구현 계획: 자동 갱신(ISR)과 연결 오류 화면 확인

## Context

명세는 `docs/roadmap/tasks/007-isr-and-error-screen-check.md`에 있고 여기엔 다시 적지 않는다. 이 계획은 실제 수행 순서와 확인 방법만 적는다.

Task 006으로 `/`가 실제 Notion 데이터로 빌드되고, 오류는 try/catch 없이 공용 `error.tsx`로 간다. 이 Task는 그 두 동작(F010 5분 자동 갱신, F011 오류 화면·"다시 시도")이 실제로 동작하는지 **확인**하는 Task다. 코드 변경은 README 2줄뿐이고, `notion.ts`는 오류 메시지가 모호할 때만 다듬는다.

미리 확인한 사실(2026-10-25):

- `error.tsx`는 "문제가 생겼습니다" + "다시 시도"(`retry()`)가 이미 있다. `requireEnv` 메시지는 `환경변수 ${name}가 없습니다. .env.local을 확인하세요`로 변수 이름·해결 위치가 들어 있어 그대로 둘 가능성이 크다
- **환경변수 우선순위를 실제로 검증했다**: `NOTION_DATA_SOURCE_ID= NOTION_API_KEY=wrong-key node -e "…loadEnvConfig…"`로 Next.js 로더를 돌리니 빈 문자열과 틀린 키가 `.env.local` 로드 뒤에도 그대로 남았다. 그러므로 `.env.local`을 고치지 않고 명령 앞 변수만으로 오류 상황을 만들 수 있다(폴백 (c) 불필요)
- 포트 3000에는 Task 004 때 내가 켠 dev 서버가 아직 떠 있다. `next dev` 두 개는 `.next/dev`를 공유해 이상 동작 위험이 있으므로 **시작할 때 이 서버를 끈다**(내가 켠 것이라 끄는 것도 내 몫). 그 뒤 임시 서버는 전부 3001로, `npm run start`는 3000으로 띄운다
- `next start`는 `.next`를, `next dev`는 `.next/dev`를 쓰므로 둘을 동시에 띄워도 충돌하지 않는다
- 브라우저 확인은 Task 004·006과 같이 npx 캐시의 `playwright-core` + 설치된 Chrome(headless) 스크립트로 한다. "다시 시도"가 `retry`(다시 불러옴)인지는 스크립트에서 `page.on("request")`로 `/` 요청이 다시 나가는지 세어 확인한다
- Notion 현재 7행. ISR 확인용 이름 수정은 **사용자**가 한다(테스트 행 추가 안 함, Task 006 결정). 첫 카드 "홈앤힐 포비 이지클린 구스 스윙 패브릭 소파, 블랙네이비, 3인용"을 권한다(화면 맨 앞이라 찾기 쉬움)
- 5분 대기는 포그라운드 `sleep`이 막혀 있으므로, "310초 대기 → 두 번 요청 → HTML에서 ' ✔' 검색"을 하는 Node 스크립트를 **백그라운드**로 돌리고 완료 알림을 받는다

## 결정 사항

1. README 2줄은 "환경변수" 절 끝(Vercel 문장 앞)에 넣는다. developer가 쓰고 check-all·build까지 돌린다
2. 오류 확인 (a)(b)는 메인 대화가 3001 포트 임시 dev 서버로 수행. `.env.local`은 손대지 않는다
3. ISR 확인은 developer의 build 결과로 메인 대화가 `npm run start`(3000)를 띄워 수행. Notion 이름 수정은 사용자에게 그 시점에 요청하고, 수정 완료 답을 받은 뒤 대기 스크립트를 시작한다
4. `requireEnv` 문구는 (b) 확인에서 터미널 출력이 작업 파일의 기대 문구와 같으면 그대로 둔다
5. 확인이 끝나면 임시 서버를 모두 끈다. 3000번 dev 서버는 다시 켜지 않는다(필요하면 사용자가 `npm run dev`)

## 수행 순서

1. **준비 (메인 대화)**: 3000번 dev 서버 종료(`lsof -ti:3000 | xargs kill`), 포트 비었는지 확인
2. **README + 검사 (developer)**: 작업 파일·이 계획 경로를 넘겨 구현 단계 1~2. README "환경변수" 절 끝에 2줄, `npm run check-all` → `npm run build`(라우트 표 `○ /  Revalidate 5m`), 작업 파일 단계 1·2 체크·상태 `진행 중`. README만 바뀌면 Stop hook이 돌지 않으므로 developer가 직접 돌린다
3. **오류 (a) 잘못된 키 (메인 대화)**: `NOTION_API_KEY=wrong-key npm run dev -- -p 3001`을 백그라운드로 → 로그에 "Ready" 확인 → headless Chrome으로 `http://localhost:3001/` 열기 → "문제가 생겼습니다"·"다시 시도" 텍스트 존재 확인, 스크린샷 `task-007-error.png` → `page.on("request")`로 요청 수를 센 뒤 "다시 시도" 클릭 → `/` 요청이 다시 나가고 오류 화면이 다시 그려지는지, 서버 로그에 401이 두 번 찍히는지 확인 → 서버 종료
4. **오류 (b) 환경변수 누락 (메인 대화)**: `NOTION_DATA_SOURCE_ID= npm run dev -- -p 3001` 백그라운드 → `/` 요청(curl 또는 headless) → 서버 로그에 `환경변수 NOTION_DATA_SOURCE_ID가 없습니다. .env.local을 확인하세요` 확인 → 서버 종료. 문구가 명확하면 `notion.ts` 변경 없음
5. **정상 복귀 (메인 대화)**: 임시 서버가 모두 꺼진 상태에서 `npm run start`(3000, 2단계 build 결과)를 백그라운드로 띄우고 `/`가 7장을 돌려주는지 확인(이것이 F011 "정상 키로 복귀" 확인이자 ISR 첫 방문). `curl -sD - -o /dev/null http://localhost:3000/ | grep -i x-nextjs-cache` → `HIT`. 스크린샷 `task-007-isr-before.png`, 첫 방문 시각 기록
6. **사용자 작업 요청**: Notion에서 첫 소품 이름 끝에 " ✔"를 붙여 달라고 요청하고 답을 기다린다(여기서만 멈춤)
7. **ISR 대기·확인 (메인 대화)**: 답을 받으면 즉시 한 번 요청해 "아직 안 바뀜(HIT)"을 기록 → 백그라운드 스크립트: 첫 방문 시각부터 310초가 지날 때까지 대기 → 요청 1(헤더 `STALE` 기대, 본문에 ' ✔' 없음) → 3초 대기 → 요청 2(본문에 ' ✔' 있음, 헤더 `HIT`) → 없으면 5초 간격 최대 6회 재시도 → 결과 출력 → 완료 알림 뒤 headless로 스크린샷 `task-007-isr-after.png`
8. **원복 요청**: 사용자에게 Notion 이름 원복을 요청. `npm run start` 종료
9. **마무리**: 작업 파일 단계 3~9·완료 기준 체크, 상태 `완료`, 변경 요약. 계획 파일을 `plans/2026-10-25-project-notion-cms-task-007-plan.md`로 옮기고 완료 상태. `development-planner`에게 "Task 007 완료로 바꿔줘"(Phase 3 ✅, Task 008 우선순위). 커밋은 `/ship`(README만이면 code-reviewer 불필요, `notion.ts`를 고쳤다면 필요)

## 검증 (= 작업 파일 완료 기준)

- check-all·build 통과, `/` `○` Revalidate 5m (developer 보고)
- README에 두 줄 추가, 3행 변경 없음
- (a) 3001에서 오류 화면 텍스트 2개 확인, "다시 시도" 클릭 시 `/` 요청 재발생 + 401 재출력, 스크린샷
- (b) 서버 로그에 한국어 누락 메시지
- 정상: `npm run start`에서 7장, 헤더 `HIT`
- ISR: 수정 직후 불변(HIT) → 310초 뒤 요청 1 `STALE` → 요청 2에 ' ✔' 반영. 스크린샷 2장
- 원복: Notion 이름 원복(사용자 확인), `.env.local` 미수정, 3000·3001 모두 비어 있음(`lsof`)
- `git status --short`: `README.md`(+ 작업 파일·ROADMAP·계획)만

## 범위 밖

- Vercel 배포·환경변수 등록(Task 008)
- 오류 전용 페이지, `error.tsx` 문구 변경(PRD 가정으로 금지)
- 작은 수정 3건(카드 `alt` 중복, 칩 포커스 링, `toSafeUrl` 대소문자·공백)은 별도

## 완료 상태 (2026-10-25)

- ✅ 1·2단계: 3000 dev 서버 종료, developer가 README 2문단 추가, check-all·build 통과(`/` `○` Revalidate 5m)
- ✅ 3·4단계: 3001 임시 서버로 (a) 잘못된 키 → 오류 화면 + "다시 시도" 재요청(401 2회) 확인, (b) 빈 `NOTION_DATA_SOURCE_ID` → 한국어 누락 메시지 확인. `notion.ts` 변경 없음, `.env.local` 미수정
- ✅ 5~8단계: `npm run start`에서 HIT·7장(정상 복귀). 사용자가 Notion 이름에 " ✔" 추가 → 반영 확인(1차는 5분 창 이후 응답이라 STALE 단계는 관찰 못 함, 추정 사유 기록). 원복을 2차 변경으로 활용해 283초 시점 HIT(불변) → 310초 뒤 STALE(이전 페이지) → HIT(새 페이지) 순서를 문서대로 관찰. 서버 종료
- ✅ 9단계: 작업 파일 완료, 변경 파일 README뿐
- ROADMAP 갱신은 development-planner, 커밋은 `/ship`(README만이라 code-reviewer 불필요)

## 남은 작업

- 없음. 다음은 "Task 008 작업 파일 만들어줘" (Vercel 배포·환경변수 등록)
