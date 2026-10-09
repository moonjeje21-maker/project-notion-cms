// 메뉴 한 줄의 정보 (external이 true면 새 탭에서 여는 바깥 링크)
export type NavItem = {
  title: string
  href: string
  external?: boolean
}

type SiteConfig = {
  name: string
  title: string
  description: string
  mainNav: NavItem[]
  footerNav: NavItem[]
}

// 사이트 이름과 메뉴를 한곳에서 관리한다 (머리글·바닥글·메타데이터가 함께 읽는다)
export const siteConfig: SiteConfig = {
  name: "Living Wishlist",
  title: "Living Wishlist",
  description:
    "사고 싶은 인테리어 소품을 Notion 표에 적으면 카드 한 화면으로 모아 보여 주는 읽기 전용 사이트",
  // 머리글 메뉴
  mainNav: [{ title: "홈", href: "/" }],
  // 바닥글 링크
  footerNav: [],
}

// 바깥 링크를 새 탭에서 안전하게 열 때 붙이는 속성
export function externalLinkProps(item: NavItem) {
  return item.external
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {}
}
