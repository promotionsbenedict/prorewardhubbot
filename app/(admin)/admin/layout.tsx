import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminNav } from "@/components/admin/admin-nav"
import { ClaimAdmin } from "@/components/admin/claim-admin"
import { getAdminContext } from "@/lib/admin"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const ctx = await getAdminContext()

  if (!ctx.user) redirect("/login?next=/admin")

  // Bootstrap gate: if no admin exists yet, let the first signed-in user claim
  // the role. Otherwise, non-admins are sent back to the app.
  if (!ctx.isAdmin) {
    if (ctx.adminsExist) redirect("/app")
    return <ClaimAdmin userName={ctx.user.name} />
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary sm:inline-flex">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to app</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
        <aside className="md:w-52 md:shrink-0">
          <div className="md:sticky md:top-20">
            <AdminNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
