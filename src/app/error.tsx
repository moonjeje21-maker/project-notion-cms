"use client" // 오류 화면은 클라이언트 컴포넌트여야 한다

import { useEffect } from "react"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type ErrorPageProps = {
  error: Error & { digest?: string }
  // Next.js 16.3: 다시 불러와서 다시 그리는 함수 (reset은 다시 불러오지 않고 다시 그리기만 한다)
  retry: () => void
}

// 페이지를 그리다가 예상하지 못한 오류가 났을 때 보이는 화면
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    // 오류 수집 서비스를 쓰면 여기서 보낸다
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 flex-col p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert aria-hidden />
          </EmptyMedia>
          <EmptyTitle>문제가 생겼습니다</EmptyTitle>
          <EmptyDescription>
            잠시 후 다시 시도해 주세요. 계속되면 관리자에게 알려 주세요.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => retry()}>다시 시도</Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
