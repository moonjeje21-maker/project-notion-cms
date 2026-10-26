// Node가 .ts 파일을 직접 실행할 때 import 경로를 풀어 주는 작은 훅
// - "@/..." 별칭 → 프로젝트의 src/ 폴더 (tsconfig의 paths와 같은 규칙)
// - 확장자 없는 경로(예: "../src/lib/notion") → 못 찾으면 ".ts"를 붙여 다시 찾는다
// - .ts 파일은 ES 모듈(module-typescript)이라고 미리 알려 준다. package.json에 "type"이 없어
//   Node가 형식을 추측하며 내는 MODULE_TYPELESS_PACKAGE_JSON 경고를 막기 위해서다
// 사용: node --import ./scripts/register-ts-paths.mjs scripts/어떤-스크립트.ts
import { registerHooks } from "node:module"
import { pathToFileURL } from "node:url"
const SRC = pathToFileURL(`${process.cwd()}/src/`).href
registerHooks({
  resolve(specifier, context, nextResolve) {
    const spec = specifier.startsWith("@/") ? SRC + specifier.slice(2) : specifier
    let result
    try {
      result = nextResolve(spec, context)
    } catch (err) {
      const noExt = !/\.[a-zA-Z0-9]+$/.test(spec)
      if (err?.code === "ERR_MODULE_NOT_FOUND" && noExt) result = nextResolve(`${spec}.ts`, context)
      else throw err
    }
    if (result.url.endsWith(".ts")) return { ...result, format: "module-typescript" }
    return result
  },
})
