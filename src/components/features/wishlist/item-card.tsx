"use client"

import { useState } from "react"
import { ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Item } from "@/lib/items"

type ItemCardProps = {
  item: Item
}

// 소품 한 개를 보여 주는 카드 (정사각형 이미지 · 이름 · 종류 배지)
// 참고 디자인대로 테두리 없는 둥근 이미지 + 아래 글자로 그린다. shadcn Card 부품은 쓰지 않는다
// 이미지가 비었거나 깨지면 회색 배경 + 아이콘 대체 그림을 같은 크기로 그린다 (F004)
// 상품 링크가 있으면 카드 전체가 새 탭으로 열리는 링크, 없으면 눌리지 않는 카드(흐린 배지)로 구분한다 (F002)
// 종류가 비어 "기타"로 들어온 소품은 배지에 그대로 "기타"가 보인다 (F004)
export function ItemCard({ item }: ItemCardProps) {
  // 이미지 요청이 실패했는지(onError). 한 번 실패하면 같은 주소를 다시 시도하지 않는다
  const [failed, setFailed] = useState(false)
  const showFallback = item.imageUrl === "" || failed
  const hasLink = item.url !== ""

  // hydration보다 먼저 실패한 이미지는 onError가 울리지 않으므로, 요소가 붙을 때 이미 깨졌는지 한 번 더 본다
  // (complete는 요청이 끝났다는 뜻, naturalWidth 0은 그림을 못 받았다는 뜻. lazy 이미지는 요청 전이라 complete가 false)
  const markIfAlreadyFailed = (img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true)
    }
  }

  // 안쪽 내용(이미지 영역 + 글자 영역)은 한 번만 적고, 바깥 태그(<a>/<div>)만 링크 여부로 바꾼다
  const content = (
    <>
      {showFallback ? (
        // 대체 그림: 이미지와 같은 정사각형 영역에 회색 배경(bg-muted) + 아이콘만 가운데 (F004)
        // imageUrl이 빈 문자열이면 <img>를 아예 그리지 않아 src="" 콘솔 오류가 나지 않는다
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-muted">
          <ImageOff
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      ) : (
        // 정상 이미지. 로드 전에는 회색(bg-muted)이 보이고, 링크 카드에 마우스를 올리면 살짝 흐려진다
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- 외부 이미지는 일반 img 사용 (CLAUDE.md) */}
          <img
            ref={markIfAlreadyFailed}
            src={item.imageUrl}
            alt={item.name}
            className="size-full object-cover transition group-hover:opacity-90"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </div>
      )}
      <div className="flex flex-col gap-1 px-0.5">
        <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
        {/* 링크 없는 카드는 배지만 흐리게 해 "눌리지 않는 카드"임을 알린다. 이름은 읽어야 하는 정보라 흐리지 않는다 */}
        <Badge
          variant="secondary"
          className={hasLink ? undefined : "opacity-60"}
        >
          {item.category}
        </Badge>
      </div>
    </>
  )

  // 상품 링크가 있으면 카드 전체가 새 탭 링크 (F002)
  // rel="noopener noreferrer"는 새 탭이 window.opener로 원래 탭을 조작하지 못하게 막는다
  if (hasLink) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2"
      >
        {content}
      </a>
    )
  }

  // 링크가 없으면 보이기만 하는 카드. 커서는 기본 화살표이고 눌러도 아무 일이 없다
  return <div className="flex flex-col gap-2">{content}</div>
}
