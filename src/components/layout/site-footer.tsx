import { externalLinkProps, siteConfig } from "@/lib/site"

// 페이지 맨 아래 바닥글
export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>© {siteConfig.name}</p>
        <nav className="flex flex-wrap items-center gap-4">
          {siteConfig.footerNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              {...externalLinkProps(item)}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
