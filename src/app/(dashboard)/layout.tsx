import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// 대시보드형 틀: 왼쪽 사이드바 + 상단 바 + 본문 (SidebarInset이 <main> 역할을 한다)
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
