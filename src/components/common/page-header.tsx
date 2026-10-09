type PageHeaderProps = {
  title: string
  description?: React.ReactNode
  // 제목 오른쪽에 놓을 버튼 등
  children?: React.ReactNode
}

// 페이지 맨 위의 제목 + 설명 묶음
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </section>
  )
}
