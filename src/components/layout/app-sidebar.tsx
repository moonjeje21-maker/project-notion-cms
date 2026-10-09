"use client"

import * as React from "react"
import Link from "next/link"
import { Rocket } from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { siteConfig } from "@/lib/site"

// 대시보드 왼쪽 사이드바. 접으면 아이콘만 남는다 (shadcn sidebar-07 블록 기반)
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Rocket className="size-4" aria-hidden />
                </div>
                <span className="truncate font-medium">{siteConfig.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={siteConfig.sidebarNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={siteConfig.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
