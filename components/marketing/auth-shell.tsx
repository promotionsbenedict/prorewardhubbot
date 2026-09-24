import Link from "next/link"
import { Flame, Gift, Sparkles } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

const highlights = [
  { icon: Sparkles, text: "A fresh Daily Drop every single day" },
  { icon: Flame, text: "Build streaks and multiply your earnings" },
  { icon: Gift, text: "Claim airtime, data, cash, and mystery rewards" },
]

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-accent p-10 text-primary-foreground lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-16 top-20 size-72 rounded-full bg-background/30 blur-3xl" />
          <div className="absolute bottom-10 right-0 size-72 rounded-full bg-background/20 blur-3xl" />
        </div>
        <Link href="/" className="relative">
          <Logo className="text-primary-foreground" />
        </Link>
        <div className="relative space-y-8">
          <h2 className="max-w-sm text-balance font-display text-4xl font-extrabold leading-tight">
            Show up daily. Earn real rewards.
          </h2>
          <ul className="space-y-4">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-background/20 backdrop-blur">
                  <h.icon className="size-4.5" />
                </span>
                <span className="text-sm text-primary-foreground/90">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">© {new Date().getFullYear()} Pro Reward Hub</p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
