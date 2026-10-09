import { PageHeader } from "@/components/common/page-header"
import { ComponentDemo } from "@/components/features/home/component-demo"
import { StackCard } from "@/components/features/home/stack-card"
import { siteConfig } from "@/lib/site"
import { stackItems } from "@/lib/stack"

export default function Home() {
  return (
    <>
      <PageHeader
        title={siteConfig.title}
        description={
          <>
            Next.js, TypeScript, Tailwind CSS, shadcn/ui, lucide-react가 설정된
            상태로 바로 시작할 수 있습니다.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              src/app/(marketing)/page.tsx
            </code>{" "}
            를 고쳐서 시작하세요.
          </>
        }
      />

      {/* 기술 스택 카드: 휴대폰 1열 → 태블릿 2열 → 데스크톱 3열 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stackItems.map((item) => (
          <StackCard key={item.name} item={item} />
        ))}
      </section>

      <ComponentDemo />
    </>
  )
}
