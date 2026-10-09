import type { LucideIcon } from "lucide-react"
import {
  Atom,
  BellRing,
  Code,
  Component,
  Layers,
  Shapes,
  SunMoon,
  Wind,
} from "lucide-react"

// 스타터 킷에 들어 있는 기술 하나의 정보
export type StackItem = {
  name: string
  version: string
  description: string
  href: string
  icon: LucideIcon
}

// 시작 화면에 보여 줄 기술 스택 목록 (버전을 올리면 여기도 함께 고친다)
export const stackItems: StackItem[] = [
  {
    name: "Next.js",
    version: "16.3",
    description: "파일 이름으로 페이지를 만드는 React 프레임워크 (App Router)",
    href: "https://nextjs.org/docs",
    icon: Layers,
  },
  {
    name: "React",
    version: "19.3",
    description: "화면을 컴포넌트 단위로 나눠 만드는 UI 라이브러리",
    href: "https://react.dev",
    icon: Atom,
  },
  {
    name: "TypeScript",
    version: "5.9",
    description: "자바스크립트에 타입을 붙여 실수를 미리 잡아 주는 언어",
    href: "https://www.typescriptlang.org/docs/",
    icon: Code,
  },
  {
    name: "Tailwind CSS",
    version: "4.3",
    description: "클래스 이름만으로 스타일을 입히는 CSS 프레임워크",
    href: "https://tailwindcss.com/docs",
    icon: Wind,
  },
  {
    name: "shadcn/ui",
    version: "4.21",
    description: "프로젝트 안에 복사해서 고쳐 쓰는 UI 컴포넌트 모음",
    href: "https://ui.shadcn.com/docs",
    icon: Component,
  },
  {
    name: "lucide-react",
    version: "1.52",
    description: "React 컴포넌트로 쓰는 아이콘 모음",
    href: "https://lucide.dev/guide/packages/lucide-react",
    icon: Shapes,
  },
  {
    name: "next-themes",
    version: "0.4",
    description: "라이트/다크 테마를 바꾸고 선택을 기억해 주는 라이브러리",
    href: "https://github.com/pacocoursey/next-themes",
    icon: SunMoon,
  },
  {
    name: "sonner",
    version: "2.0",
    description: "화면 구석에 잠깐 뜨는 알림(토스트) 라이브러리",
    href: "https://sonner.emilkowal.ski",
    icon: BellRing,
  },
]
