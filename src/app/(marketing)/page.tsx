import { PageHeader } from "@/components/common/page-header"
import { siteConfig } from "@/lib/site"

export default function Home() {
  return (
    <PageHeader
      title={siteConfig.title}
      description="소품 목록 페이지 자리입니다. F001에서 카드 그리드가 들어갑니다."
    />
  )
}
