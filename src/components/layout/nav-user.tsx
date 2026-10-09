"use client"

import { BadgeCheckIcon, ChevronsUpDownIcon, LogOutIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { SiteUser } from "@/lib/site"

// 프로필 그림 + 이름 + 이메일 한 줄
function UserSummary({ user }: { user: SiteUser }) {
  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
        {/* 그림이 없으면 이름 첫 글자를 보여 준다 */}
        <AvatarFallback className="rounded-lg">
          {user.name.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </>
  )
}

// 사이드바 맨 아래의 사용자 메뉴 (shadcn sidebar-07 블록 기반)
export function NavUser({ user }: { user: SiteUser }) {
  const { isMobile } = useSidebar()

  // 실제 로그인 기능이 없으므로 예시 메뉴는 알림만 띄운다
  const notReady = () => toast.info("아직 연결되지 않은 예시 메뉴입니다")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserSummary user={user} />
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserSummary user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={notReady}>
              <BadgeCheckIcon />
              계정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={notReady}>
              <LogOutIcon />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
