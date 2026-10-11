// 화면에서 쓰는 소품 한 개의 모양 (Notion 행을 이 형태로 바꿔서 쓴다)
// 없는 값은 빈 문자열("")로 두고, category만은 비면 OTHER_CATEGORY를 넣는다
export type Item = {
  // Notion 페이지(행)의 고유 식별자
  id: string
  // 소품 이름
  name: string
  // 상품 링크 (없으면 "")
  url: string
  // 이미지 주소 (없으면 "")
  imageUrl: string
  // 종류 (가구·조명·화분 등. 비어 있으면 OTHER_CATEGORY)
  category: string
}

// 종류가 비어 있을 때 대신 쓰는 값. 배지와 칩에 그대로 보인다
export const OTHER_CATEGORY = "기타"
