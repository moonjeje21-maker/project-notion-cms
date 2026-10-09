import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

// 사이트형 틀: 머리글 + 본문 + 바닥글
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-12">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
