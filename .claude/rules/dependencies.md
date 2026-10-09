---
paths:
  - "package.json"
  - "package-lock.json"
  - "next.config.ts"
  - "eslint.config.mjs"
  - "tsconfig.json"
---

# 의존성·설정 파일 주의

- 버전 올리기: `npx next upgrade`, `npm outdated`. 버전이 바뀌면 `README.md`의 버전 표도 함께 고친다
- ESLint는 9 유지 (eslint-plugin-react가 ESLint 10 미지원). TypeScript 7로 올리려면 `next.config.ts`에 `experimental.useTypeScriptCli: true` 필요
- `npm audit`의 high 경고는 모두 `fast-glob → micromatch → braces` 한 줄기에서 나오고, `eslint-config-next`와 `shadcn` CLI가 끌어온다 (브라우저로 가는 코드가 아니다). `npm audit fix --force`는 eslint-config-next를 14로, shadcn을 1.0으로 내리므로 쓰지 않는다
- `cn()`은 `clsx` + `tailwind-merge`가 아니라 shadcn의 `cn` 패키지에서 온다 (`src/lib/utils.ts`). `globals.css`가 `shadcn/tailwind.css`를 import하므로 `shadcn`과 `cn`은 `dependencies`에 둔다
- Zustand, React Hook Form + Zod는 아직 설치돼 있지 않다. 처음 필요해질 때 설치한다 (설치 명령은 `README.md`의 "필요할 때 설치할 라이브러리" 표)
- `next-env.d.ts`는 git에 없고 dev/build/typegen이 만든다
- 폴더를 옮긴 뒤 build가 `.next/dev/types/validator.ts`에서 없는 파일을 찾으면 예전 개발 서버가 남긴 캐시다. `.next/dev/types`를 지우고 다시 실행한다
