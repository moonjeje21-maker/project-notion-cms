# 2026-10-10 project-notion-cms 스타터 킷 정리 계획

## 배경 (Context)

이 저장소는 스타터 킷 `claude-nextjs`에서 시작했고, 대시보드 화면·시작 화면 데모·예제 데이터 같은 **보일러플레이트**(틀만 보여 주려고 넣어 둔 예제 코드)가 남아 있다. PRD(`docs/prd/2026-10-09-project-notion-cms-prd.md`)의 "메뉴 구조" 절은 "스타터 킷의 대시보드 틀은 쓰지 않는다. `mainNav`를 '홈' 하나로 줄이고 `(dashboard)` 경로는 삭제한다"고 정했다.

목표: 예제 코드를 지우고 `npm run lint`·`npm run build`가 통과하는 깨끗한 바탕을 만든다. 남는 코드의 내용은 고치지 않는다(삭제와, 지운 것을 가리키는 참조 제거만). 실제 화면(F001)은 다음 작업이다.

실행은 `starter-cleaner` 에이전트를 "실행" 지시와 이 계획 파일 경로를 넘겨 다시 호출해서 한다. git 명령은 실행하지 않는다(커밋은 사용자가 `/ship`으로).

## 조사 결과 (import 사용처)

`grep -rn 'from "@/' src` 전수 조사로 확인한 것:

| 지울 파일 | 누가 import하나 | 판정 |
|---|---|---|
| `src/app/(dashboard)/` (layout, dashboard/page, dashboard/loading) | 아무도 안 함 (폴더 규칙 라우트) | 삭제 |
| `components/layout/app-sidebar.tsx`, `dashboard-header.tsx` | `(dashboard)/layout.tsx`만 | 삭제 |
| `components/layout/nav-main.tsx`, `nav-user.tsx` | `app-sidebar.tsx`만 | 삭제 |
| `components/features/home/component-demo.tsx`, `stack-card.tsx` | `(marketing)/page.tsx`만 | page.tsx를 비운 뒤 삭제 |
| `lib/stack.ts` | `(marketing)/page.tsx`, `stack-card.tsx`만 | 삭제 |
| `hooks/use-mobile.ts` | `ui/sidebar.tsx`만 | sidebar와 함께 삭제 |
| `ui/sonner.tsx` | `app/layout.tsx`의 `<Toaster />`만 | layout에서 뺀 뒤 삭제 |
| `ui/tooltip.tsx` | `app/layout.tsx`(`TooltipProvider`), `ui/sidebar.tsx` | 둘 다 사라지면 삭제 |
| `sonner` npm 패키지 | `ui/sonner.tsx`, `component-demo.tsx`, `nav-user.tsx` | 전부 지워지면 `npm uninstall` |

정리 후에도 import되는 `ui/*`: `button`, `empty`, `dropdown-menu`, `sheet`. 여기에 PRD F001이 쓸 `card`·`badge`를 보존.

## A. 지울 파일 (33개 + 폴더 3개)

1. `src/app/(dashboard)/` 폴더 전체
2. `src/components/layout/app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, `dashboard-header.tsx`
3. `src/components/features/home/` 폴더 전체 (`features/`는 빈 폴더가 되어 git에서 사라짐. F001에서 다시 생김)
4. `src/lib/stack.ts`
5. `src/hooks/use-mobile.ts` (`src/hooks/`도 비어서 사라짐)
6. 미사용 shadcn 부품 21개: `src/components/ui/{alert-dialog,alert,avatar,breadcrumb,checkbox,collapsible,dialog,field,input,label,select,separator,sidebar,skeleton,sonner,spinner,switch,table,tabs,textarea,tooltip}.tsx`
7. `npm uninstall sonner` (`package.json`·`package-lock.json`이 바뀜. `.claude/rules/dependencies.md`를 먼저 읽고, `shadcn`·`cn`은 건드리지 않으며 `npm audit fix --force`는 쓰지 않음)

남는 `ui/`: `button`, `badge`, `card`, `dropdown-menu`, `empty`, `sheet` (6개)

## B. 고칠 코드 파일 (5개)

| 파일 | 바뀌는 내용 |
|---|---|
| `src/lib/site.ts` | `lucide-react` import 삭제(사이드바 아이콘 전용) · `SidebarNavItem`·`SiteUser` 타입과 주석 삭제 · `SiteConfig`에서 `sidebarNav`·`user` 필드 삭제 · `name`·`title` → `"Living Wishlist"`, `description` → PRD 목적 문장 · `mainNav` → `[{ title: "홈", href: "/" }]` · `footerNav` → `[]` (필드·`NavItem` 타입·`externalLinkProps`는 site-header·mobile-nav·site-footer가 쓰므로 유지) |
| `src/app/(marketing)/page.tsx` | `ComponentDemo`·`StackCard`·`stackItems` import와 사용부 삭제. `PageHeader`(title=`siteConfig.title`, description="소품 목록 페이지 자리입니다. F001에서 카드 그리드가 들어갑니다.")만 남김 |
| `src/app/layout.tsx` | `Toaster`·`TooltipProvider` import 삭제, `<TooltipProvider>{children}</TooltipProvider>` → `{children}`, `<Toaster />`와 그것을 설명하는 한국어 주석("토스트가 그려지는 자리") 삭제. 글꼴·메타데이터·ThemeProvider·`suppressHydrationWarning`은 그대로 |
| `next.config.ts` | `devIndicators` 블록과 주석 삭제 → `const nextConfig: NextConfig = {}` (설정 파일 수정은 이 한 건뿐) |
| `package.json` | `npm uninstall sonner`로만 변경 (직접 편집 안 함) |

## C. 문서에서 고칠 문장 (재작성 아님, 낡은 문장만)

**`README.md`**
- 첫 문단 → Living Wishlist 핵심 정보(목적·사용자·로그인 없음·스타터 킷 출신·Notion 연동 아직 없음)
- 기술 스택 표의 `sonner` 줄 삭제 (표 자체는 유지)
- "들어 있는 화면" 표의 `/dashboard` 줄 삭제
- 폴더 구조 그림: "최상위: 글꼴, 테마, 토스트" → "글꼴, 테마", `(dashboard)/`·`hooks/`·`stack.ts` 줄 삭제, layout 목록 → `site-header, site-footer, mobile-nav`, features → "(아직 없음. F001 소품 목록 자리)"
- "설치된 shadcn/ui 컴포넌트" → "기본: button, badge, card / 화면 틀: sheet, dropdown-menu / 피드백: empty", "필요할 때 추가할 것"에 separator·skeleton·dialog·tooltip 등 덧붙임

**`CLAUDE.md`**
- "시작 화면·대시보드·`lib/site.ts`의 이름과 메뉴는 아직 스타터 킷 값이다" → "스타터 킷 예제(대시보드·시작 화면 데모)는 2026-10-10에 정리했다. `lib/site.ts`는 Living Wishlist 값이고, 시작 화면은 F001 전까지 자리 표시 문구만 있다"
- `hooks/use-mobile.ts` 덮어쓰기 금지 문장 삭제
- "화면 틀은 둘이다" → "화면 틀은 `app/(marketing)/`(머리글 + 바닥글) 하나다. …" (나머지 `<main>` 규칙 유지)
- "사이트 이름과 메뉴는 `lib/site.ts`에서만 고친다"까지만 남기고 `sidebarNav` 문장 삭제

**`.claude/rules/dependencies.md`**
- `src/lib/stack.ts` 언급 삭제 → "버전이 바뀌면 `README.md`의 버전 표도 함께 고친다"
- `devIndicators` 유지 규칙 줄 삭제

**`.claude/rules/theme.md`**
- "(글꼴·메타데이터·ThemeProvider·TooltipProvider·Toaster)" → "(글꼴·메타데이터·ThemeProvider)"

**PRD `docs/prd/2026-10-09-project-notion-cms-prd.md`**
- "이미 설치된 컴포넌트" → "button, badge, card, dropdown-menu, sheet, empty"
- 기술 스택의 `sonner 2.0.8` 줄 삭제
- 기능 명세(F001~F011)·메뉴 구조·데이터 모델은 손대지 않음

## 지우지 않고 남기는 것 (이유)

- `ui/card.tsx`·`ui/badge.tsx`: 정리 후 미사용이지만 F001이 바로 씀
- `common/page-header.tsx`: 자리 표시 페이지가 계속 씀
- `site-footer.tsx` 틀: PRD가 바닥글을 언급하지 않아 그대로 둠 (`footerNav`가 빈 배열이면 `© Living Wishlist`만 보임)
- `globals.css`의 `--sidebar-*` 토큰: `theme.md` 규칙대로 CSS 정리 없음
- `components.json`의 `"hooks": "@/hooks"` 별칭: shadcn CLI가 나중에 쓸 설정이라 유지
- 모든 한국어 주석 (지우는 `<Toaster />`를 설명하는 한 줄만 예외)
- `.claude/agents/starter-cleaner.md`, `-validation.md`: 지시·기록 문서라 손대지 않음
- `.env`·Prettier는 만들지 않음

## 검증

```bash
npm run lint
npm run build
```

둘 다 오류 없이 끝나야 한다. build가 `.next/dev/types/validator.ts`나 `.next/types/`에서 없는 `(dashboard)` 파일을 찾으면 `dependencies.md`의 캐시 규칙대로 해당 폴더를 지우고 다시 실행한다. 완료 후 이 파일에 완료 상태와 남은 작업을 적는다.

## 다음 작업

F001(Notion 연동 + 카드 그리드) 구현. `@notionhq/client` 설치는 `library-docs.md` 절차로 버전 재확인.

## 완료 상태 (2026-10-10, starter-cleaner 에이전트 실행)

### 완료한 항목

- **A. 삭제**: `src/app/(dashboard)/` 전체 · `components/layout/{app-sidebar,nav-main,nav-user,dashboard-header}.tsx` · `components/features/home/` 전체 · `lib/stack.ts` · `hooks/use-mobile.ts` · 미사용 shadcn 부품 21개(alert-dialog, alert, avatar, breadcrumb, checkbox, collapsible, dialog, field, input, label, select, separator, sidebar, skeleton, sonner, spinner, switch, table, tabs, textarea, tooltip) · `npm uninstall sonner` (`package.json`·`package-lock.json`에서 sonner 제거 확인). `src/hooks/`·`src/components/features/` 빈 폴더도 제거. 남은 `ui/`: badge, button, card, dropdown-menu, empty, sheet
- **B. 코드 수정**: `lib/site.ts`(Living Wishlist 이름·설명, `mainNav` "홈" 하나, `footerNav` 빈 배열, 사이드바·사용자 타입과 값 삭제) · `app/(marketing)/page.tsx`(PageHeader + 자리 표시 문구만) · `app/layout.tsx`(Toaster·TooltipProvider 제거) · `next.config.ts`(devIndicators 제거)
- **C. 문서 수정**: `README.md` 8곳 · `CLAUDE.md` 4곳 · `.claude/rules/dependencies.md` 2곳 · `.claude/rules/theme.md` 1곳 · PRD 2곳 (계획 C에 적힌 문장만)

### 검증 결과

- `npm run lint`: 오류·경고 없음 (종료 코드 0)
- `npm run build`: 성공. 라우트는 `/`(정적)와 `/_not-found` 둘뿐. `.next/dev/types/`·`.next/types/`의 캐시 오류는 나지 않아 캐시 삭제는 하지 않음
- git 명령은 실행하지 않음. 커밋은 사용자가 `/ship`으로 한다

### 남은 작업

- F001(Notion 연동 + 카드 그리드) 구현. `@notionhq/client` 설치는 `.claude/rules/library-docs.md` 절차로 버전 재확인
- `.env.local`(`NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`)은 Notion 연동 작업에서 만든다
- `globals.css`의 `--sidebar-*` 색 토큰은 `theme.md` 규칙대로 남겨 둠 (필요하면 별도 작업)
