import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { StackItem } from "@/lib/stack"

type StackCardProps = {
  item: StackItem
}

// 기술 하나를 카드 모양으로 보여 주는 컴포넌트
export function StackCard({ item }: StackCardProps) {
  const Icon = item.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Icon className="size-6 text-primary" aria-hidden />
          <Badge variant="secondary">v{item.version}</Badge>
        </div>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          공식 문서
          <ArrowRight className="size-4" aria-hidden />
        </a>
      </CardFooter>
    </Card>
  )
}
