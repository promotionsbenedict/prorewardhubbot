"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Flame, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import type { NotificationItem } from "@/lib/types"
import type { LiveUser } from "@/lib/dashboard"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function TopBar({
  user,
  isAdmin = false,
  notifications = [],
}: {
  user: LiveUser
  isAdmin?: boolean
  notifications?: NotificationItem[]
}) {
  const router = useRouter()
  const unread = notifications.filter((n) => n.unread).length

  async function handleLogout() {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/app" className="md:hidden">
          <Logo />
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent">
            <Flame className="size-4" />
            {user.streak} day streak
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent md:hidden">
            <Flame className="size-4" />
            {user.streak}
          </span>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="relative grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Bell className="size-4.5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4.5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {unread}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  <span className="text-xs font-normal text-muted-foreground">{unread} unread</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No notifications yet. Complete a mission to get started.
                </p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
                    <div className="flex w-full items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          n.unread ? "bg-accent" : "bg-transparent",
                        )}
                      />
                      <span className="text-sm font-medium text-foreground">{n.title}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground">{n.time}</span>
                    </div>
                    <span className="pl-3.5 text-xs text-muted-foreground">{n.body}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Account menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.handle}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/app/profile" />}>Profile</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/support" />}>Support</DropdownMenuItem>
              {isAdmin ? (
                <DropdownMenuItem render={<Link href="/admin" />} className="text-primary">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Admin panel
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
