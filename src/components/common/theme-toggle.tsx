"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 라이트 / 다크 / 시스템 설정 중에서 테마를 고르는 버튼
export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {/* 다크 모드에서는 해가 숨고 달이 보인다 */}
          <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">테마 바꾸기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          라이트
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          다크
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          시스템 설정
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
