import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  type PageObjectResponse,
} from "@notionhq/client"

// 이 파일이 읽는 환경변수 이름. 둘 다 .env.local에 둔다 (배포 시에는 Vercel 설정에 등록)
type NotionEnvName = "NOTION_API_KEY" | "NOTION_DATA_SOURCE_ID"

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
// 열 이름을 Item으로 바꾸는 매핑은 아직 없다 (Task 006에서 추가). SDK 응답 행을 그대로 돌려준다
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
