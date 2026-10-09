"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// 앱 전체를 감싸서 라이트/다크 테마를 기억하고 바꿔 주는 설정 (next-themes)
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
