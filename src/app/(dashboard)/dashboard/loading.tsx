import { Skeleton } from "@/components/ui/skeleton"

// 페이지 데이터를 기다리는 동안 보이는 자리 표시 (page.tsx와 같은 배치)
export default function DashboardLoading() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </>
  )
}
