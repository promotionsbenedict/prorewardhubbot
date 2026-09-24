import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Logo } from "@/components/logo"
import { TopBar } from "@/components/dashboard/top-bar"
import { BottomNav, SideNav } from "@/components/dashboard/dashboard-nav"
import { LevelBadge } from "@/components/dashboard/level-badge"
import { auth } from "@/lib/auth"
import { getDashboardData, getNotifications } from "@/lib/dashboard"
import { getAdminContext } from "@/lib/admin"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const [{ user }, adminCtx, notifications] = await Promise.all([
    getDashboardData(),
    getAdminContext(),
    getNotifications(),
  ])

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-border/60 bg-card/30 p-4 md:flex">
        <Link href="/" className="px-2 pt-2">
          <Logo />
        </Link>
        <SideNav />
        <div className="mt-auto">
          <LevelBadge xp={user.xp} />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <TopBar user={user} isAdmin={adminCtx.isAdmin} notifications={notifications} />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 md:pb-8">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
