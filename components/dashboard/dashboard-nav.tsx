"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gift, Home, ListChecks, Users, User, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/missions", label: "Missions", icon: ListChecks },
  { href: "/app/rewards", label: "Rewards", icon: Gift },
  { href: "/app/wallet", label: "Wallet", icon: Wallet },
  { href: "/app/invite", label: "Invite", icon: Users },
  { href: "/app/profile", label: "Profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-colors",
                  active && "bg-primary/12",
                )}
              >
                <item.icon className="size-5" />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function SideNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
