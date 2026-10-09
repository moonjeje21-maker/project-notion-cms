"use client"

import { Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 설치한 shadcn/ui 컴포넌트가 제대로 보이는지 확인하는 예시 모음
// (토스트 버튼에 클릭 핸들러가 있어서 클라이언트 컴포넌트다)
export function ComponentDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>컴포넌트 미리보기</CardTitle>
        <CardDescription>
          src/components/ui 에 들어 있는 기본 컴포넌트입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Button>
            <Sparkles aria-hidden />
            기본 버튼
          </Button>
          <Button variant="secondary">보조 버튼</Button>
          <Button variant="outline">테두리 버튼</Button>
          <Button variant="ghost">고스트 버튼</Button>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="outline">테두리</Badge>
          <Badge variant="destructive">경고</Badge>
        </div>

        <Separator />

        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="demo-email">이메일</Label>
          <Input id="demo-email" type="email" placeholder="you@example.com" />
        </div>

        <Separator />

        {/* 피드백: 토스트(구석에 잠깐 뜨는 알림)와 팝업 창 */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("저장되었습니다")}
          >
            토스트 띄우기
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">팝업 창 열기</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>팝업 창</DialogTitle>
                <DialogDescription>
                  화면 가운데에 떠서 확인이나 입력을 받는 창입니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>닫기</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        <Tabs defaultValue="first" className="max-w-sm">
          <TabsList>
            <TabsTrigger value="first">첫 번째 탭</TabsTrigger>
            <TabsTrigger value="second">두 번째 탭</TabsTrigger>
          </TabsList>
          <TabsContent value="first" className="text-sm text-muted-foreground">
            탭을 누르면 아래 내용이 바뀝니다.
          </TabsContent>
          <TabsContent value="second" className="text-sm text-muted-foreground">
            두 번째 탭의 내용입니다.
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
