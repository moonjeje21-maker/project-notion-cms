import type { Metadata } from "next"
import Link from "next/link"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
}

// 없는 주소로 들어왔을 때 보이는 404 화면
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX aria-hidden />
          </EmptyMedia>
          <EmptyTitle>페이지를 찾을 수 없습니다</EmptyTitle>
          <EmptyDescription>
            주소가 바뀌었거나 없는 페이지입니다.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">홈으로 가기</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
