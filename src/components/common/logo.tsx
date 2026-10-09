import Link from "next/link"
import { Rocket } from "lucide-react"

import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

// 사이트 이름과 아이콘. 누르면 홈으로 간다
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <Rocket className="size-5" aria-hidden />
      {siteConfig.name}
    </Link>
  )
}
