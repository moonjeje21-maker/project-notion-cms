"use client"

import { useState } from "react"
import { PackageOpen, SearchX } from "lucide-react"
import {
  ALL_CATEGORY,
  CategoryChips,
} from "@/components/features/wishlist/category-chips"
import { ItemGrid } from "@/components/features/wishlist/item-grid"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { OTHER_CATEGORY, type Item } from "@/lib/items"

type WishlistViewProps = {
  items: Item[]
}

// 소품 목록의 종류 값을 등장 순서대로 중복 없이 모으고, "기타"는 맨 끝으로 보낸다 (PRD 가정 "칩 순서")
// "전체"는 여기 넣지 않는다 (CategoryChips가 맨 앞에 붙인다)
function getCategories(items: Item[]): string[] {
  const seen: string[] = []
  for (const item of items) {
    if (!seen.includes(item.category)) {
      seen.push(item.category)
    }
  }
  const withoutOther = seen.filter((category) => category !== OTHER_CATEGORY)
  return seen.includes(OTHER_CATEGORY)
    ? [...withoutOther, OTHER_CATEGORY]
    : withoutOther
}

type EmptyStateProps = {
  icon: React.ReactNode
  title: string
  description: string
}

// 빈 상태 묶음 (F004). 소품 0개와 필터 결과 0개가 문구만 다르므로 한 번만 적는다
function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

// 소품 목록 화면. 종류 칩(F003)으로 브라우저 안에서만 거르고, 빈 상태 2종(F004)을 그린다
// 필터는 주소(쿼리)를 바꾸지 않는다 — 주소가 바뀌면 /의 5분 자동 갱신(F010) 캐시가 깨지기 때문
export function WishlistView({ items }: WishlistViewProps) {
  const [selected, setSelected] = useState(ALL_CATEGORY)

  // 소품이 하나도 없으면 칩 없이 빈 상태만 그린다
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen />}
        title="아직 소품이 없어요"
        description="Notion 표에 소품을 추가하면 여기에 나타나요"
      />
    )
  }

  const categories = getCategories(items)
  const filtered =
    selected === ALL_CATEGORY
      ? items
      : items.filter((item) => item.category === selected)

  return (
    <div className="flex flex-col gap-6">
      <CategoryChips
        categories={categories}
        selected={selected}
        onSelect={setSelected}
      />
      {/* 필터 결과가 0개여도 칩은 남겨 "전체"나 다른 종류로 돌아갈 수 있게 한다 */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX />}
          title="이 종류의 소품이 없어요"
          description="다른 종류를 눌러 보세요"
        />
      ) : (
        <ItemGrid items={filtered} />
      )}
    </div>
  )
}
