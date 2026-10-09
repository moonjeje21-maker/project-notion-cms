# project-notion-cms

스타터 킷 `claude-nextjs`(Next.js · TypeScript · Tailwind CSS · shadcn/ui · lucide-react)에서 시작한 프로젝트입니다. Notion 연동은 아직 없습니다.

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
| sonner | 2.0.8 | 토스트(화면 구석에 잠깐 뜨는 알림) |
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

## 들어 있는 화면

| 주소 | 화면 틀(레이아웃) | 파일 |
|---|---|---|
| `/` | 사이트형: 머리글 + 본문 + 바닥글, 휴대폰에서는 서랍 메뉴 | `src/app/(marketing)/` |
| `/dashboard` | 대시보드형: 왼쪽 사이드바 + 상단 바 | `src/app/(dashboard)/` |
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
│  ├─ layout.tsx         최상위: 글꼴, 테마, 토스트
│  ├─ not-found.tsx · error.tsx
│  ├─ (marketing)/       사이트형 틀과 시작 화면
│  └─ (dashboard)/       대시보드형 틀과 /dashboard
├─ components/
│  ├─ ui/                1층 · 기본 부품 (shadcn CLI로만 추가)
│  ├─ common/            2층 · 여러 화면이 같이 쓰는 조합 (logo, theme-toggle, page-header)
│  ├─ layout/            3층 · 화면 틀 조각 (site-header, site-footer, mobile-nav,
│  │                            app-sidebar, nav-main, nav-user, dashboard-header)
│  ├─ features/          4층 · 한 기능 전용 (home/stack-card, home/component-demo)
│  └─ providers/         앱 전체를 감싸는 설정 (theme-provider)
├─ hooks/                use-mobile — 화면이 휴대폰 폭인지 알려 주는 훅
└─ lib/                  0층 · 데이터와 도우미
   ├─ site.ts            사이트 이름, 메뉴 목록
   ├─ stack.ts           시작 화면의 기술 스택 목록
   └─ utils.ts           cn() — 클래스 이름 합치기 도우미
```

## 설치된 shadcn/ui 컴포넌트

- 기본: button, badge, card, separator, input, label
- 화면 틀: sheet, dropdown-menu, sidebar, breadcrumb, avatar, collapsible, tooltip, skeleton
- 폼: field, textarea, select, checkbox, switch
- 피드백: sonner(토스트), dialog, alert-dialog, alert, empty, spinner
- 내용 표시: tabs, table

필요할 때 추가할 것: calendar, chart, command, combobox, carousel, drawer, pagination 등 → `npx shadcn@latest add <이름>`

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
