import type { Item } from "@/lib/items"

type WishlistViewProps = {
  items: Item[]
}

// 소품 목록 화면의 자리. 지금은 개수만 보여 주고, Task 002부터 카드 그리드가 들어간다
export function WishlistView({ items }: WishlistViewProps) {
  return <p className="text-muted-foreground">소품 {items.length}개</p>
}
