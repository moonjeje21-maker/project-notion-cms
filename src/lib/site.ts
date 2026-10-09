import type { LucideIcon } from "lucide-react"
import { BookOpen, House, LayoutDashboard } from "lucide-react"

// 메뉴 한 줄의 정보 (external이 true면 새 탭에서 여는 바깥 링크)
export type NavItem = {
  title: string
  href: string
  external?: boolean
}

// 사이드바 메뉴 한 줄: 아이콘이 있고, 펼쳐지는 하위 메뉴를 가질 수 있다
export type SidebarNavItem = NavItem & {
  icon: LucideIcon
  items?: NavItem[]
}

// 사이드바 아래에 보여 줄 사용자 정보
export type SiteUser = {
  name: string
  email: string
  avatar?: string
}

type SiteConfig = {
  name: string
  title: string
  description: string
  mainNav: NavItem[]
  sidebarNav: SidebarNavItem[]
  footerNav: NavItem[]
  user: SiteUser
}

// 사이트 이름과 메뉴를 한곳에서 관리한다 (머리글·바닥글·사이드바·메타데이터가 함께 읽는다)
export const siteConfig: SiteConfig = {
  name: "Notion CMS",
  title: "Notion CMS",
  description: "Notion을 콘텐츠 관리 도구(CMS)로 쓰는 Next.js 사이트",
  // 머리글 메뉴
  mainNav: [
    { title: "홈", href: "/" },
    { title: "대시보드", href: "/dashboard" },
    {
      title: "컴포넌트 둘러보기",
      href: "https://ui.shadcn.com/docs/components",
      external: true,
    },
  ],
  // 대시보드 사이드바 메뉴
  sidebarNav: [
    { title: "대시보드", href: "/dashboard", icon: LayoutDashboard },
    { title: "사이트 홈", href: "/", icon: House },
    {
      title: "공식 문서",
      href: "https://nextjs.org/docs",
      icon: BookOpen,
      items: [
        { title: "Next.js", href: "https://nextjs.org/docs", external: true },
        {
          title: "shadcn/ui",
          href: "https://ui.shadcn.com/docs",
          external: true,
        },
        {
          title: "Tailwind CSS",
          href: "https://tailwindcss.com/docs",
          external: true,
        },
      ],
    },
  ],
  // 바닥글 링크
  footerNav: [
    { title: "Next.js", href: "https://nextjs.org/docs", external: true },
    { title: "shadcn/ui", href: "https://ui.shadcn.com/docs", external: true },
    { title: "lucide", href: "https://lucide.dev/icons", external: true },
  ],
  // 예시 사용자 (실제 로그인 기능을 붙이면 이 값을 바꾼다)
  user: {
    name: "홍길동",
    email: "user@example.com",
  },
}

// 바깥 링크를 새 탭에서 안전하게 열 때 붙이는 속성
export function externalLinkProps(item: NavItem) {
  return item.external
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {}
}
