import { OTHER_CATEGORY, type Item } from "@/lib/items"

// Phase 2(화면) 확인용 더미 소품. Notion 연결(Task 006)에서 삭제한다
// 배열 맨 앞이 가장 최근에 추가한 소품이라고 가정한다 (화면은 이 순서 그대로 그린다)
// 모든 화면 상태를 눌러 볼 수 있게 예외 4종을 하나씩 넣었다:
// 이미지 없음(mock-3) · 깨진 이미지 주소(mock-5) · 상품 링크 없음(mock-7) · 종류 없음 "기타"(mock-8)
export const mockItems: Item[] = [
  {
    id: "mock-1",
    name: "오크 원목 사이드 테이블",
    url: "https://example.com/products/oak-side-table",
    imageUrl: "https://picsum.photos/seed/oak-side-table/600/600",
    category: "가구",
  },
  {
    id: "mock-2",
    name: "리넨 갓 플로어 스탠드",
    url: "https://example.com/products/linen-floor-lamp",
    imageUrl: "https://picsum.photos/seed/linen-floor-lamp/600/600",
    category: "조명",
  },
  {
    // 이미지 URL이 없는 소품 (대체 그림 확인용)
    id: "mock-3",
    name: "몬스테라 대형 화분",
    url: "https://example.com/products/monstera-pot",
    imageUrl: "",
    category: "화분",
  },
  {
    id: "mock-4",
    name: "라탄 수납 바구니 세트",
    url: "https://example.com/products/rattan-basket-set",
    imageUrl: "https://picsum.photos/seed/rattan-basket/600/600",
    category: "수납",
  },
  {
    // 이미지 주소가 깨진 소품 (onError 대체 그림 확인용)
    id: "mock-5",
    name: "울 혼방 거실 러그",
    url: "https://example.com/products/wool-rug",
    imageUrl: "https://example.com/missing/wool-rug.jpg",
    category: "러그",
  },
  {
    id: "mock-6",
    name: "세라믹 캔들 홀더",
    url: "https://example.com/products/ceramic-candle-holder",
    imageUrl: "https://picsum.photos/seed/candle-holder/600/600",
    category: "소품",
  },
  {
    // 상품 링크가 없는 소품 (클릭해도 이동하지 않는 카드 확인용)
    id: "mock-7",
    name: "월넛 책장",
    url: "",
    imageUrl: "https://picsum.photos/seed/walnut-bookshelf/600/600",
    category: "가구",
  },
  {
    // 종류가 비어 있어 "기타"로 들어온 소품 ("기타" 배지·칩 확인용)
    id: "mock-8",
    name: "빈티지 벽시계",
    url: "https://example.com/products/vintage-wall-clock",
    imageUrl: "https://picsum.photos/seed/wall-clock/600/600",
    category: OTHER_CATEGORY,
  },
  {
    id: "mock-9",
    name: "펜던트 조명 3구",
    url: "https://example.com/products/pendant-light",
    imageUrl: "https://picsum.photos/seed/pendant-light/600/600",
    category: "조명",
  },
]
