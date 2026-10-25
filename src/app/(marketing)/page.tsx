import { PageHeader } from "@/components/common/page-header"
import { WishlistView } from "@/components/features/wishlist/wishlist-view"
import { getItems } from "@/lib/notion"
import { siteConfig } from "@/lib/site"

// 5분(300초)마다 뒤에서 페이지를 다시 만든다 (F010 자동 갱신)
// 이 페이지는 빌드 때 Notion을 읽어 미리 만들고, 5분이 지나면 다음 방문 때 뒤에서 다시 읽는다
export const revalidate = 300

// 서버 컴포넌트에서 Notion을 읽어 items를 props로 넘긴다
// 읽기에 실패하면 오류를 그대로 던져 app/error.tsx(F011)가 "다시 시도" 화면을 보여 준다
export default async function Home() {
  const items = await getItems()

  return (
    <>
      <PageHeader
        title={siteConfig.title}
        description={siteConfig.description}
      />
      <WishlistView items={items} />
    </>
  )
}
