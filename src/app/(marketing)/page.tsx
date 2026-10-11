import { PageHeader } from "@/components/common/page-header"
import { WishlistView } from "@/components/features/wishlist/wishlist-view"
import { mockItems } from "@/lib/mock-items"
import { siteConfig } from "@/lib/site"

// 5분(300초)마다 뒤에서 페이지를 다시 만든다 (F010 자동 갱신 자리. Notion 연결 뒤에도 이 값을 쓴다)
export const revalidate = 300

export default function Home() {
  return (
    <>
      <PageHeader
        title={siteConfig.title}
        description={siteConfig.description}
      />
      <WishlistView items={mockItems} />
    </>
  )
}
