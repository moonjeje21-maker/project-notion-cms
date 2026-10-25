// Notion 연결과 소품 표 읽기. 열 이름 ↔ Item 매핑은 이 파일에만 둔다
import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  type PageObjectResponse,
} from "@notionhq/client"
import { OTHER_CATEGORY, type Item } from "@/lib/items"

// 이 파일이 읽는 환경변수 이름. 둘 다 .env.local에 둔다 (배포 시에는 Vercel 설정에 등록)
type NotionEnvName = "NOTION_API_KEY" | "NOTION_DATA_SOURCE_ID"

// Notion 표의 열 이름. 바뀌면 여기만 고친다 (다른 파일에는 열 이름을 적지 않는다)
const COLUMN = {
  name: "이름",
  url: "상품 링크",
  category: "종류",
  imageUrl: "이미지 URL",
} as const

// 환경변수를 읽고, 비어 있으면 어느 변수가 빠졌는지 한국어로 알려 주는 오류를 던진다
// 함수 안에서만 부르므로 이 파일을 import하는 것만으로는 오류가 나지 않는다
function requireEnv(name: NotionEnvName): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`환경변수 ${name}가 없습니다. .env.local을 확인하세요`)
  }
  return value
}

// Notion 소품 표의 모든 행을 최근 추가 순으로 가져온다
// 100개가 넘어도 next_cursor를 따라 끝까지 모은다 (collectPaginatedAPI가 처리)
// 열 이름을 Item으로 바꾸는 매핑은 getItems()가 한다. 이 함수는 SDK 응답 행을 그대로 돌려준다
export async function fetchAllRows(): Promise<PageObjectResponse[]> {
  const notion = new Client({ auth: requireEnv("NOTION_API_KEY") })

  const rows = await collectPaginatedAPI(notion.dataSources.query, {
    // Notion SDK 5.x는 데이터베이스 ID가 아니라 데이터 소스 ID로 조회한다
    data_source_id: requireEnv("NOTION_DATA_SOURCE_ID"),
    // 최근에 추가한 소품이 위로 오게 생성 시각 내림차순
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  })

  // 속성이 다 들어 있는 완전한 페이지 행만 남긴다 (부분 응답·데이터 소스 객체 제외)
  return rows.filter(isFullPage)
}

// 카드가 <a href>·<img src>에 그대로 넣어도 안전한 주소만 남긴다
// Notion의 URL 열은 입력값 형식을 검사하지 않으므로 "javascript:..." 같은 값이 들어올 수 있다
// http:// 또는 https://로 시작하는 값만 그대로 두고, 그 외(null·빈 값·다른 접두어)는 ""로 바꾼다
export function toSafeUrl(value: string | null): string {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return ""
}

// 제목(title) 열을 읽는다. 서식 때문에 여러 조각으로 나뉘어 와도 plain_text를 이어 붙인다
// 열이 없거나 타입이 다르면 ""을 돌려주고 오류는 던지지 않는다 (열 하나 때문에 사이트 전체가 멈추지 않게)
function readTitle(row: PageObjectResponse, name: string): string {
  const prop = row.properties[name]
  if (prop?.type !== "title") return ""
  return prop.title.map((t) => t.plain_text).join("")
}

// URL 열을 읽어 안전한 주소만 돌려준다. 열이 없거나 타입이 다르면 ""
function readUrl(row: PageObjectResponse, name: string): string {
  const prop = row.properties[name]
  if (prop?.type !== "url") return ""
  return toSafeUrl(prop.url)
}

// 선택(select) 열을 읽는다. 열이 없거나 타입이 다르거나 값이 비어 있으면 OTHER_CATEGORY("기타")
// "기타" 처리는 화면이 아니라 여기(매핑 단계)에서 한 번만 한다
function readSelect(row: PageObjectResponse, name: string): string {
  const prop = row.properties[name]
  const value = prop?.type === "select" ? (prop.select?.name ?? "") : ""
  return value || OTHER_CATEGORY
}

// Notion 행 하나를 화면용 Item으로 바꾼다
function toItem(row: PageObjectResponse): Item {
  return {
    id: row.id,
    name: readTitle(row, COLUMN.name),
    url: readUrl(row, COLUMN.url),
    imageUrl: readUrl(row, COLUMN.imageUrl),
    category: readSelect(row, COLUMN.category),
  }
}

// 소품 전체를 Item 배열로 돌려준다 (최근 추가 순은 fetchAllRows()가 이미 맞춰 둔다)
// 환경변수 누락·API 실패 오류는 잡지 않고 그대로 위로 보낸다 → app/error.tsx가 받아 "다시 시도"를 보여 준다 (F011)
export async function getItems(): Promise<Item[]> {
  const rows = await fetchAllRows()
  return rows.map(toItem)
}
