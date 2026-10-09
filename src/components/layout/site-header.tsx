import Link from "next/link"

import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { externalLinkProps, siteConfig } from "@/lib/site"

// 페이지 맨 위에 고정되는 머리글
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        {/* 휴대폰: 서랍 메뉴 버튼 / 태블릿 이상: 가로 메뉴 */}
        <MobileNav />
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {siteConfig.mainNav.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href} {...externalLinkProps(item)}>
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
