import Link from "next/link"
import { Send } from "lucide-react"
import { Logo } from "@/components/logo"

const groups = [
  {
    title: "Platform",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/rewards", label: "Rewards" },
      { href: "/faq", label: "FAQ" },
      { href: "/app", label: "Open Reward Hub" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Sign Up" },
      { href: "/login", label: "Log In" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              A mobile-first rewards and engagement platform. Show up daily, complete drops, and claim real rewards.
            </p>
            <a
              href="https://t.me/prorewardhub_bot"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Send className="size-4" />
              @prorewardhub_bot
            </a>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="font-display text-sm font-semibold text-foreground">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Pro Reward Hub. All rights reserved.</p>
          <p>prorewardhub.org</p>
        </div>
      </div>
    </footer>
  )
}
