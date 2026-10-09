import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { externalLinkProps, siteConfig } from "@/lib/site"

// 작은 화면에서 왼쪽에서 열리는 서랍 메뉴
export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu aria-hidden />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{siteConfig.name}</SheetTitle>
          <SheetDescription className="sr-only">사이트 메뉴</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {siteConfig.mainNav.map((item) => (
            // SheetClose로 감싸서 메뉴를 누르면 서랍이 닫힌다
            <SheetClose key={item.href} asChild>
              <Button asChild variant="ghost" className="justify-start">
                <Link href={item.href} {...externalLinkProps(item)}>
                  {item.title}
                </Link>
              </Button>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
