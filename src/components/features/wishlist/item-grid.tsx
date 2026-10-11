import type { Item } from "@/lib/items"
import { ItemCard } from "@/components/features/wishlist/item-card"

type ItemGridProps = {
  items: Item[]
}

// 소품 카드를 휴대폰 2열 / 데스크톱(lg, 1024px 이상) 4열로 나열한다 (F001)
// 순서는 받은 배열 그대로 그린다 (최근 추가가 위에 오도록 하는 건 데이터 쪽 몫)
// 빈 배열일 때의 "아직 소품이 없어요" 빈 상태는 Task 005에서 넣는다
export function ItemGrid({ items }: ItemGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  )
}
