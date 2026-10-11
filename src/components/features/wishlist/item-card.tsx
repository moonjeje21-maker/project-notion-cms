import { Badge } from "@/components/ui/badge"
import type { Item } from "@/lib/items"

type ItemCardProps = {
  item: Item
}

// 소품 한 개를 보여 주는 카드 (정사각형 이미지 · 이름 · 종류 배지)
// 참고 디자인대로 테두리 없는 둥근 이미지 + 아래 글자로 그린다. shadcn Card 부품은 쓰지 않는다
// 이미지 없음·깨짐의 대체 그림, 상품 링크 새 탭 열기, "기타" 배지 흐림은 Task 004에서 덧붙인다
export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 이미지가 비었거나 아직 로드 전이면 회색(bg-muted)이 보인다 */}
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- 외부 이미지는 일반 img 사용 (CLAUDE.md) */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
        <Badge variant="secondary">{item.category}</Badge>
      </div>
    </div>
  )
}
