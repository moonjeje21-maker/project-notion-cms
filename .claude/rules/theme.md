---
paths:
  - "src/app/globals.css"
  - "src/app/layout.tsx"
---

# 테마·글꼴 주의

- 테마는 전부 `src/app/globals.css`에 있다: `:root` / `.dark`의 CSS 변수 → `@theme inline`이 `--color-*`로 연결 → `bg-background`, `text-muted-foreground` 같은 클래스
- 글꼴: `layout.tsx`의 Geist `variable: "--font-sans"`와 `globals.css`의 `--font-sans`는 이름이 같아야 한다. 한쪽만 바꾸면 글꼴이 빠진다
- 다크 모드는 `next-themes`가 `<html>`에 `dark` 클래스를 붙이는 방식이다 (`layout.tsx`의 `ThemeProvider attribute="class"`, 그래서 `<html>`에 `suppressHydrationWarning`이 있다). 토글은 `common/theme-toggle.tsx`
- 최상위 `layout.tsx`(글꼴·메타데이터·ThemeProvider)는 하나만 둔다
