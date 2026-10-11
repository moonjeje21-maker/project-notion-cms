import { ItemGrid } from "@/components/features/wishlist/item-grid"
import type { Item } from "@/lib/items"

type WishlistViewProps = {
  items: Item[]
}

// 소품 목록 화면. 지금은 카드 그리드만 그리고, Task 005에서 종류 칩과 빈 상태가 들어간다
export function WishlistView({ items }: WishlistViewProps) {
  return <ItemGrid items={items} />
}
