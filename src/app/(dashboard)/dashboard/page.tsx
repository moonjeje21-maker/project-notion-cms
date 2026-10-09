import type { Metadata } from "next"
import { Inbox } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "대시보드",
}

// 예시 숫자 카드 (실제 데이터로 바꿔서 쓴다)
const stats = [
  { label: "방문자", value: "1,280", note: "지난 7일" },
  { label: "가입", value: "64", note: "지난 7일" },
  { label: "전환율", value: "5.0%", note: "가입 ÷ 방문자" },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="대시보드"
        description="사이드바가 있는 화면 틀의 예시입니다. 숫자는 예시 데이터입니다."
      />

      {/* 숫자 카드: 휴대폰 1열 → 태블릿 이상 3열 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {stat.note}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* 아직 내용이 없을 때 보여 주는 빈 상태 */}
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden />
          </EmptyMedia>
          <EmptyTitle>아직 내용이 없습니다</EmptyTitle>
          <EmptyDescription>
            src/app/(dashboard)/dashboard/page.tsx 를 고쳐서 표나 차트를
            넣으세요.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  )
}
