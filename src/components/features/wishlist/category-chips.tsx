"use client"

import { Button } from "@/components/ui/button"

// "전체" 칩의 라벨. Notion 종류 값이 아니라 화면 전용이라 lib/items.ts가 아닌 여기에 둔다
export const ALL_CATEGORY = "전체"

type CategoryChipsProps = {
  // "전체"를 뺀 종류 목록 (WishlistView가 등장 순서 + "기타" 맨 끝으로 정렬해서 넘긴다)
  categories: string[]
  // 지금 선택된 종류. "전체"면 ALL_CATEGORY
  selected: string
  // 칩을 눌렀을 때 선택 종류를 바꾸는 함수
  onSelect: (category: string) => void
}

// "전체" + 종류 칩을 가로 한 줄로 나열한다 (F003)
// 휴대폰에서는 줄바꿈하지 않고 가로 스크롤로 넘친 칩을 본다. 주소(쿼리)는 바꾸지 않는다
export function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div
      role="group"
      aria-label="종류 필터"
      className="flex gap-2 overflow-x-auto"
    >
      {[ALL_CATEGORY, ...categories].map((category) => {
        const isSelected = category === selected
        return (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={isSelected ? "default" : "outline"}
            aria-pressed={isSelected}
            className="shrink-0 rounded-full"
            onClick={() => onSelect(category)}
          >
            {category}
          </Button>
        )
      })}
    </div>
  )
}
