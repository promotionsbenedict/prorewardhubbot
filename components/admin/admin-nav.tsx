"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Gift, ArrowDownToLine } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/redemptions", label: "Redemptions", icon: Gift },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 md:flex-col">
      {links.map((link) => {
        const active = pathname === link.href
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
