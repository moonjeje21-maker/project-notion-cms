# project-notion-cms

**Living Wishlist** — 사고 싶은 인테리어 소품을 Notion 표에 "이름 + 상품 링크"만 적으면 웹 한 화면에 카드로 모아 보여 주는 읽기 전용 사이트입니다. 사용자는 본인(Notion에서 입력)과 주소를 공유받은 지인(웹에서 읽기만)이며 로그인은 없습니다. 스타터 킷 `claude-nextjs`(Next.js · TypeScript · Tailwind CSS · shadcn/ui · lucide-react)에서 시작했고, Notion 데이터 소스에서 소품을 읽어 보여 줍니다.

## 기술 스택 (2026-10-04 기준)

| 기술 | 버전 | 비고 |
|---|---|---|
| Next.js | 16.3.8 | App Router, Turbopack |
| React | 19.3.0 | |
| TypeScript | 5.9.3 | create-next-app 기본값 (TS 7은 `experimental.useTypeScriptCli` 필요) |
| Tailwind CSS | 4.3.3 | `@tailwindcss/postcss` 방식 |
| shadcn/ui | CLI 4.21.1 | 프리셋 `radix-nova`, 기본 색 neutral |
| lucide-react | 1.52.0 | shadcn 기본 아이콘 |
| next-themes | 0.4.6 | 다크 모드 전환 (shadcn 공식 방식) |
| @notionhq/client | 5.27.0 | Notion 데이터 소스 조회 (SDK 5.x, 데이터베이스 ID가 아닌 데이터 소스 ID로 조회) |
| ESLint | 9.39.5 | eslint-plugin-react가 아직 ESLint 10을 지원하지 않아 9 유지 |

Node.js 20.9 이상이 필요합니다.

## 시작하기

```bash
npm install      # 라이브러리 설치
npm run dev      # 개발 서버 → http://localhost:3000
npm run build    # 배포용 빌드 (타입 검사 포함)
npm run start    # 빌드 결과 실행
npm run lint     # 코드 규칙 검사
```

`src/app/(marketing)/page.tsx`를 고치면 시작 화면이 바로 바뀝니다.

## 환경변수

Notion 표를 읽으려면 프로젝트 폴더에 `.env.local` 파일을 만들고 두 값을 넣습니다. 이 파일은 `.gitignore`의 `.env*` 규칙으로 git에 올라가지 않습니다. 값은 절대 커밋하거나 채팅에 붙여 넣지 마세요.

```
NOTION_API_KEY=         # Notion 통합의 API 키 (Internal Integration Secret)
NOTION_DATA_SOURCE_ID=  # 소품 표의 데이터 소스 ID
```

값을 얻는 순서:

1. Notion 통합 페이지(notion.so/my-integrations)에서 **내부 통합**을 하나 만들고 API 키를 복사합니다
2. 소품 표를 열어 "연결(Connections)"에서 방금 만든 통합을 연결합니다 (연결하지 않으면 키가 맞아도 읽지 못합니다)
3. 같은 표에서 "**데이터 소스 관리 → 데이터 소스 ID 복사**"로 ID를 복사합니다. 주소창에 보이는 데이터베이스 ID와는 다른 값이며, SDK 5.x는 데이터 소스 ID로만 조회합니다. 데이터베이스 ID를 넣으면 `object_not_found`(404) 오류가 납니다

`npm run build`도 빌드 중 Notion을 읽어 `/`를 미리 만들므로, `.env.local`과 네트워크가 없으면 빌드가 실패합니다.

Notion에서 고친 내용은 약 5분 뒤 반영됩니다. 개발 서버(`npm run dev`)에서는 캐시가 돌지 않아 매번 새로 읽으므로, 자동 갱신 확인은 `npm run build && npm run start`로 합니다.

배포할 때는 Vercel 프로젝트 설정의 Environment Variables에 같은 이름으로 등록합니다.

## 들어 있는 화면

| 주소 | 화면 틀(레이아웃) | 파일 |
|---|---|---|
| `/` | 사이트형: 머리글 + 본문 + 바닥글, 휴대폰에서는 서랍 메뉴 | `src/app/(marketing)/` |
| 없는 주소 | 404 화면 | `src/app/not-found.tsx` |
| 오류가 났을 때 | 오류 화면 (다시 시도 버튼) | `src/app/error.tsx` |

`(marketing)`처럼 괄호가 붙은 폴더는 주소에 나타나지 않습니다. 같은 틀을 쓰는 페이지를 묶는 용도입니다.
새 페이지는 쓰고 싶은 틀의 폴더 안에 만듭니다 (예: `src/app/(marketing)/about/page.tsx` → 주소 `/about`).

사이트 이름과 메뉴 목록은 `src/lib/site.ts` 한 파일에서 고칩니다.

## 폴더 구조와 컴포넌트 계층

아래층은 위층을 가져다 쓰지 않습니다. 새 컴포넌트는 "누가 쓰는가"에 따라 자리를 정합니다.

```
src/
├─ app/                  5층 · 페이지와 레이아웃 (주소 = 폴더)
│  ├─ layout.tsx         최상위: 글꼴, 테마
│  ├─ not-found.tsx · error.tsx
│  └─ (marketing)/       사이트형 틀과 시작 화면
├─ components/
│  ├─ ui/                1층 · 기본 부품 (shadcn CLI로만 추가)
│  ├─ common/            2층 · 여러 화면이 같이 쓰는 조합 (logo, theme-toggle, page-header)
│  ├─ layout/            3층 · 화면 틀 조각 (site-header, site-footer, mobile-nav)
│  ├─ features/          4층 · 한 기능 전용 (wishlist/ — 소품 목록 화면 부품)
│  └─ providers/         앱 전체를 감싸는 설정 (theme-provider)
└─ lib/                  0층 · 데이터와 도우미
   ├─ items.ts           Item 타입 (소품 한 개의 모양)
   ├─ notion.ts          Notion 연결과 소품 표 읽기
   ├─ site.ts            사이트 이름, 메뉴 목록
   └─ utils.ts           cn() — 클래스 이름 합치기 도우미
```

## 설치된 shadcn/ui 컴포넌트

- 기본: button, badge, card
- 화면 틀: sheet, dropdown-menu
- 피드백: empty

필요할 때 추가할 것: separator, skeleton, dialog, tooltip, input, label, field, tabs, table, calendar, chart, command, combobox, carousel, drawer, pagination 등 → `npx shadcn@latest add <이름>`

## 필요할 때 설치할 라이브러리

직접 만들지 말고 검증된 라이브러리를 씁니다.

| 필요한 기능 | 라이브러리 | 설치 |
|---|---|---|
| 폼 입력 관리 + 입력값 검사 | react-hook-form + zod | `npm i react-hook-form zod @hookform/resolvers` (shadcn `field`와 함께 사용) |
| 로그인 화면 | shadcn 블록 `login-01` | `npx shadcn@latest add login-01` |
| 여러 화면이 함께 쓰는 상태 | zustand | `npm i zustand` |
| 날짜 계산·표시 | date-fns | `npm i date-fns` |
| 자주 쓰는 React 훅 모음 | usehooks-ts | `npm i usehooks-ts` |
| 주소(URL)에 상태 저장 | nuqs | `npm i nuqs` |
| 서버 데이터 불러오기·캐시 | TanStack Query | `npm i @tanstack/react-query` |
| 정렬·필터가 있는 표 | TanStack Table | `npm i @tanstack/react-table` |

## 자주 쓰는 명령

```bash
npx shadcn@latest add calendar    # shadcn 컴포넌트 추가 (src/components/ui/ 에 생성)
npx next upgrade                  # Next.js 최신 버전으로 올리기
npm outdated                      # 오래된 라이브러리 확인
```

아이콘은 [lucide.dev](https://lucide.dev/icons)에서 찾아 `import { 이름 } from "lucide-react"`로 씁니다.

## 자동 검사 (Claude Code hook)

hook은 "정해진 순간에 자동으로 도는 작은 스크립트"입니다. 설정은 `.claude/settings.json`, 스크립트는 `.claude/hooks/`에 있습니다.

| 순간 | 스크립트 | 하는 일 |
|---|---|---|
| Claude가 Edit/Write로 `src/`의 `.ts`·`.tsx` 파일을 고친 직후 | `lint-changed-file.sh` | 그 파일 하나만 `eslint`로 검사. 오류가 있으면 Claude가 바로 고칩니다 |
| Claude가 답변(턴)을 끝낼 때 | `check-after-work.sh` | `src/`나 설정 파일에 커밋 안 된 변경이 있으면 `npm run check-all`과 `npm run build`를 실행. 실패하면 Claude가 이어서 고칩니다 (자동 재시도 1회) |
| Claude가 Bash를 실행하기 전 | `block-main-commit.sh` | `main` 브랜치에서는 커밋과 푸시를 막습니다 |

같은 변경은 한 번만 검사합니다 (통과 기록은 `node_modules/.cache/living-wishlist-check/`에 남고 git에는 올라가지 않습니다). 전체 로그는 같은 폴더의 `last.log`에 있습니다. hook 목록은 Claude Code에서 `/hooks`로 볼 수 있습니다.
