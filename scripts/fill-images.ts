// 상품 링크로 "이미지 URL" 열을 채우는 로컬 스크립트 (F020)
// 사이트(src/)는 Notion을 읽기만 하고, Notion에 쓰는 코드는 이 파일뿐이다
//
// 실행: npm run fill-images            → 미리보기 (무엇을 바꿀지 보여만 주고 쓰지 않는다)
//       npm run fill-images -- --write → 실제로 Notion에 쓴다
//       npm run fill-images -- --all   → 이미 그림이 있는 행도 다시 추출해 Notion 값과 비교만 한다 (쓰지 않는다)
// Node 22.18 이상 또는 24가 필요하다 (.ts 직접 실행, --env-file-if-exists, module.registerHooks)
//
// Node 24가 .ts를 타입만 지우고 직접 실행하므로 enum 같은 "타입만이 아닌 TS 문법"은 쓰지 않는다
// "../src/lib/notion"의 확장자 없는 경로는 register-ts-paths.mjs 훅이 .ts로 풀어 준다
import { Client, isNotionClientError, type PageObjectResponse } from "@notionhq/client"
import { COLUMN, fetchAllRows, toSafeUrl } from "../src/lib/notion"

// 우리 이름을 밝힌 User-Agent. 브라우저 흉내 헤더(Chrome UA·sec-ch-ua 등)는 넣지 않는다
const USER_AGENT = "LivingWishlistBot/1.0 (+https://project-notion-cms.vercel.app)"
// 요청 하나당 기다리는 최대 시간. 넘기면 재시도 없이 "못 찾음"으로 둔다
const TIMEOUT_MS = 10_000

// 명령줄 옵션
type Options = { write: boolean; all: boolean }

// 이미지 추출 결과. 못 찾았으면 짧은 이유(429·og:image 없음 등)를 함께 돌려준다
type Extracted = { ok: true; url: string } | { ok: false; reason: string }

// HEAD(또는 Range GET)로 알아낸 응답 정보. 요청 자체가 실패하면 null
type Probe = { status: number; contentType: string }

// 행 하나의 처리 결과 한 줄에 들어갈 것
type RowResult = { name: string; linkHost: string; result: string; imageHost: string }

// --write·--all 외의 옵션은 받지 않는다 (오타로 쓰기 모드가 되는 일을 막기 위해)
function parseArgs(argv: string[]): Options | null {
  const options: Options = { write: false, all: false }
  for (const arg of argv) {
    if (arg === "--write") options.write = true
    else if (arg === "--all") options.all = true
    else {
      console.error(`알 수 없는 옵션: ${arg}`)
      // 옵션 두 개를 같이 줄 때는 "--"를 한 번만 쓴다: npm run fill-images -- --write --all
      console.error("사용법: npm run fill-images -- [--write] [--all]")
      // 잘못된 호출은 CLI 관례대로 종료 코드 1 (쓰기는 일어나지 않는다)
      process.exitCode = 1
      return null
    }
  }
  return options
}

// 사용자가 적은 주소를 스크립트가 대신 여는 구조이므로 내부망 주소는 요청하지 않는다
function isBlockedHost(url: URL): boolean {
  const host = url.hostname
  if (host === "localhost" || host.endsWith(".localhost")) return true
  if (host.endsWith(".local")) return true
  // IPv4 숫자 주소 (예: 127.0.0.1) 또는 대괄호로 감싼 IPv6 주소 (예: [::1])
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true
  if (host.startsWith("[")) return true
  return false
}

// 주소 문자열을 URL로 바꾼다. 형식이 틀리면 null (toSafeUrl은 접두어만 보므로 여기서 한 번 더 확인)
function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

// 봇 User-Agent와 시간 제한을 붙여 요청한다. 재시도는 하지 않는다
function fetchAsBot(url: string, init: { method?: string; accept: string; range?: string }): Promise<Response> {
  const headers: Record<string, string> = { "User-Agent": USER_AGENT, Accept: init.accept }
  if (init.range) headers.Range = init.range
  return fetch(url, {
    method: init.method ?? "GET",
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

// 요청 실패 원인을 짧은 한국어로 바꾼다 (시간 초과·네트워크)
function describeFetchError(error: unknown): string {
  if (error instanceof Error && error.name === "TimeoutError") return "시간 초과"
  return "네트워크"
}

// HEAD로 content-type을 알아낸다. HEAD를 거부하는 서버(405·501)면 GET + Range로 첫 바이트만 받아 확인한다
async function probe(url: string): Promise<Probe | null> {
  try {
    let res = await fetchAsBot(url, { method: "HEAD", accept: "image/*,*/*;q=0.5" })
    if (res.status === 405 || res.status === 501) {
      res = await fetchAsBot(url, { accept: "image/*,*/*;q=0.5", range: "bytes=0-0" })
      // 본문은 쓰지 않으므로 바로 버린다
      await res.body?.cancel()
    }
    return { status: res.status, contentType: res.headers.get("content-type") ?? "" }
  } catch {
    return null
  }
}

// 응답이 성공이고 content-type이 image/* 인지
function isImageProbe(p: Probe | null): boolean {
  return p !== null && p.status >= 200 && p.status < 300 && p.contentType.toLowerCase().startsWith("image/")
}

// 1단계: Shopify 가게는 /products/<handle>.json 공개 JSON으로 상품 이미지를 준다
async function extractFromShopify(link: URL): Promise<string | null> {
  const match = link.pathname.match(/\/products\/([^/]+?)\/?$/)
  if (!match) return null
  const jsonUrl = `${link.origin}/products/${match[1]}.json`
  try {
    const res = await fetchAsBot(jsonUrl, { accept: "application/json" })
    if (!res.ok) return null
    const data: unknown = await res.json()
    return readShopifyImage(data)
  } catch {
    return null
  }
}

// Shopify JSON에서 product.images[0].src → 없으면 product.image.src. 모양이 다르면 null
function readShopifyImage(data: unknown): string | null {
  if (!isRecord(data) || !isRecord(data.product)) return null
  const product = data.product
  if (Array.isArray(product.images)) {
    const first: unknown = product.images[0]
    if (isRecord(first) && typeof first.src === "string" && first.src) return first.src
  }
  if (isRecord(product.image) && typeof product.image.src === "string" && product.image.src) {
    return product.image.src
  }
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

// 2단계: 상품 페이지 HTML의 <meta property="og:image"> (없으면 twitter:image)
async function extractFromHtml(link: URL): Promise<Extracted> {
  let html: string
  try {
    const res = await fetchAsBot(link.href, { accept: "text/html,application/xhtml+xml" })
    if (!res.ok) return { ok: false, reason: String(res.status) }
    html = await res.text()
  } catch (error) {
    return { ok: false, reason: describeFetchError(error) }
  }
  const content = findMeta(html, "og:image") ?? findMeta(html, "twitter:image")
  if (!content) return { ok: false, reason: "og:image 없음" }
  // 상대 주소("/img/a.jpg")는 상품 링크를 기준으로 절대 주소로 바꾼다
  try {
    return { ok: true, url: new URL(content, link).href }
  } catch {
    return { ok: false, reason: "og:image 주소 이상" }
  }
}

// <meta property="…" content="…"> 또는 <meta name="…" content="…">에서 content를 찾는다
// HTML 파서 없이 <meta> 태그만 훑는다 (속성 순서·따옴표 종류는 상관없다)
function findMeta(html: string, key: string): string | null {
  const wanted = key.toLowerCase()
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = readAttributes(tag)
    const name = (attrs.property ?? attrs.name ?? "").toLowerCase()
    if (name === wanted && attrs.content) return decodeEntities(attrs.content.trim())
  }
  return null
}

// 태그 문자열에서 속성 이름(소문자) → 값 을 꺼낸다
function readAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  for (const m of tag.matchAll(re)) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ""
  }
  return attrs
}

// 속성값에 들어 있는 HTML 엔티티 중 주소에 흔한 것만 되돌린다 (&amp; 등)
function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

// 추출(Shopify JSON → og:image → twitter:image) 뒤 찾은 주소가 실제 그림인지 확인한다
async function extractImage(link: URL): Promise<Extracted> {
  let found: Extracted
  const shopify = await extractFromShopify(link)
  if (shopify) found = { ok: true, url: shopify }
  else found = await extractFromHtml(link)
  if (!found.ok) return found

  // 검증: 카드가 그대로 써도 안전한 주소인지, 내부망이 아닌지, 응답이 image/* 인지
  const safe = toSafeUrl(found.url)
  const imageUrl = safe ? parseUrl(safe) : null
  if (!imageUrl) return { ok: false, reason: "주소 형식" }
  if (isBlockedHost(imageUrl)) return { ok: false, reason: "내부 주소" }
  const p = await probe(imageUrl.href)
  if (!isImageProbe(p)) return { ok: false, reason: p ? `그림 아님 ${p.status}` : "그림 확인 실패" }
  return { ok: true, url: imageUrl.href }
}

// 제목(title) 열을 읽는다 (notion.ts의 readTitle과 같은 규칙. 열이 없으면 "")
function readName(row: PageObjectResponse): string {
  const prop = row.properties[COLUMN.name]
  if (prop?.type !== "title") return "(이름 없음)"
  return prop.title.map((t) => t.plain_text).join("") || "(이름 없음)"
}

// URL 열을 읽어 안전한 주소만 돌려준다 (notion.ts의 readUrl과 같은 규칙)
function readUrlColumn(row: PageObjectResponse, name: string): string {
  const prop = row.properties[name]
  if (prop?.type !== "url") return ""
  return toSafeUrl(prop.url)
}

// 주소의 host만 뽑는다 (출력에 전체 주소나 비밀 값은 찍지 않는다)
function hostOf(value: string): string {
  return parseUrl(value)?.host ?? ""
}

// Notion 오류를 한 줄로. SDK 오류면 코드도 같이 보여 준다 (예: restricted_resource = 권한 없음)
function describeNotionError(error: unknown): string {
  if (isNotionClientError(error)) return `${error.code}: ${error.message}`
  if (error instanceof Error) return error.message
  return String(error)
}

// 행 하나를 처리한다. 쓰기는 notion이 있을 때(--write)만 한다
// 쓰기에 실패하면 오류를 던져서 바깥에서 종료 코드 1로 끝낸다
async function processRow(row: PageObjectResponse, options: Options, notion: Client | null): Promise<RowResult> {
  const name = readName(row)
  const linkValue = readUrlColumn(row, COLUMN.url)
  const currentImage = readUrlColumn(row, COLUMN.imageUrl)
  const base = { name, linkHost: hostOf(linkValue), imageHost: hostOf(currentImage) }

  if (!linkValue) return { ...base, result: "링크 없음" }
  const link = parseUrl(linkValue)
  if (!link) return { ...base, result: "링크 잘못됨" }
  if (isBlockedHost(link)) return { ...base, result: "건너뜀(내부 주소)" }

  // --all이 아니면 이미 그림이 있는 행은 건너뛴다 (HEAD로 image/* 인지 확인)
  if (!options.all && currentImage) {
    if (isImageProbe(await probe(currentImage))) return { ...base, result: "이미 그림" }
  }

  const found = await extractImage(link)
  if (!found.ok) return { ...base, result: `못 찾음(${found.reason})` }
  const imageHost = hostOf(found.url)

  // --all: 추출 로직 검증용. 찾은 값과 Notion 값을 비교만 하고 쓰지 않는다
  if (options.all) {
    if (!currentImage) return { ...base, imageHost, result: "찾음(Notion은 비어 있음)" }
    return { ...base, imageHost, result: found.url === currentImage ? "일치" : "불일치" }
  }

  if (!notion) return { ...base, imageHost, result: "채울 예정" }
  await notion.pages.update({
    page_id: row.id,
    // "이미지 URL" 열 하나만 바꾼다. 다른 열은 보내지 않으므로 그대로 남는다
    properties: { [COLUMN.imageUrl]: { url: found.url } },
  })
  return { ...base, imageHost, result: "채움" }
}

// 결과 문구에서 괄호 안 이유를 뗀 이름으로 집계한다 (못 찾음(429)·못 찾음(시간 초과) → 못 찾음)
function summarize(results: RowResult[]): string {
  const counts = new Map<string, number>()
  for (const r of results) {
    const key = r.result.replace(/\(.*\)$/, "")
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const parts = [...counts].map(([key, n]) => `${key} ${n}`)
  return `집계: 전체 ${results.length} · ${parts.join(" · ")}`
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  if (!options) return

  if (options.all) {
    console.log("--all: 모든 행을 다시 추출해 Notion 값과 비교만 합니다 (쓰지 않음)")
    if (options.write) console.log("--all과 함께 쓰인 --write는 무시합니다")
  } else if (options.write) {
    console.log("쓰기 모드: 찾은 이미지 주소를 Notion의 \"이미지 URL\" 열에 씁니다")
  } else {
    console.log("미리보기 모드: Notion에 쓰지 않습니다. 실제로 쓰려면 npm run fill-images -- --write")
  }

  // 1. 전체 행 읽기. 환경변수가 없으면 notion.ts의 requireEnv가 한국어 오류를 던진다
  let rows: PageObjectResponse[]
  try {
    rows = await fetchAllRows()
  } catch (error) {
    console.error(`Notion 읽기 실패: ${describeNotionError(error)}`)
    process.exitCode = 1
    return
  }
  console.log(`Notion에서 ${rows.length}행을 읽었습니다\n`)

  // 쓰기용 Client는 --write(그리고 --all이 아닐 때)만 만든다. 키는 fetchAllRows가 이미 확인했다
  const notion = options.write && !options.all ? new Client({ auth: process.env.NOTION_API_KEY }) : null

  // 2. 행을 순서대로 하나씩 처리한다 (동시에 여러 사이트를 두드리지 않는다)
  const results: RowResult[] = []
  for (const row of rows) {
    try {
      const r = await processRow(row, options, notion)
      results.push(r)
      console.log([r.name, r.linkHost || "-", r.result, r.imageHost || "-"].join(" | "))
    } catch (error) {
      console.error(`${readName(row)} | Notion 쓰기 실패: ${describeNotionError(error)}`)
      console.error("통합 권한에 \"콘텐츠 업데이트\"가 켜져 있는지 확인하세요")
      process.exitCode = 1
      break
    }
  }

  console.log(`\n${summarize(results)}`)
  if (!options.all && !options.write && results.some((r) => r.result === "채울 예정")) {
    console.log("실제로 쓰려면: npm run fill-images -- --write")
  }
}

main()
