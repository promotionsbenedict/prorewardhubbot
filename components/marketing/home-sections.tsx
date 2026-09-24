import Link from "next/link"
import { ArrowRight, CalendarCheck, Coins, Flame, Gift, ShieldCheck, Trophy, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: CalendarCheck,
    title: "Daily Drops",
    body: "A fresh set of missions every day. Complete the required ones to keep your streak and earn bonus points.",
  },
  {
    icon: Coins,
    title: "Points & XP",
    body: "Earn spendable Points for rewards and permanent XP that levels you up from Starter to Elite.",
  },
  {
    icon: Flame,
    title: "Streaks",
    body: "Show up daily to build multipliers and unlock milestone rewards at day 3, 7, 14, and 30.",
  },
  {
    icon: Gift,
    title: "Real Rewards",
    body: "Redeem airtime, data, cash, vouchers, subscriptions, and mystery boxes — all verified.",
  },
  {
    icon: Users,
    title: "Referrals",
    body: "Invite friends and earn when they join, stay active, and qualify. Grow your crew, grow your rewards.",
  },
  {
    icon: ShieldCheck,
    title: "Pro Score",
    body: "A trust score built from real, consistent activity. Higher scores unlock premium reward tiers.",
  },
]

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          One habit. Real rewards.
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Everything is designed around a single daily habit — and a system that rewards consistency over luck.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const steps = [
  { icon: UserPlus, title: "Join in seconds", body: "Sign up with your phone or email. Optionally connect Telegram for bonus missions." },
  { icon: CalendarCheck, title: "Complete Daily Drops", body: "Check in, visit projects, answer quizzes, and finish missions to earn Points and XP." },
  { icon: Flame, title: "Build your streak", body: "Return daily to grow multipliers and climb from Starter to Elite level." },
  { icon: Trophy, title: "Claim real rewards", body: "Redeem your Points for airtime, data, cash, vouchers, and mystery boxes." },
]

export function HowItWorksPreview() {
  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">Four steps from sign-up to your first real reward.</p>
          </div>
          <Button render={<Link href="/how-it-works" />} nativeButton={false} variant="outline" className="rounded-full">
            See the full flow
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-border bg-background p-6">
              <span className="font-display text-sm font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
              <s.icon className="mt-4 size-6 text-foreground" />
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const stats = [
  { value: "5", label: "missions per Daily Drop" },
  { value: "6", label: "levels from Starter to Elite" },
  { value: "9", label: "reward categories" },
  { value: "30", label: "day streak for the mystery box" },
]

export function StatsStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-gradient-to-br from-card to-card/40 p-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-accent p-8 text-center sm:p-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-10 -top-10 size-48 rounded-full bg-background/40 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 size-48 rounded-full bg-background/40 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
            Your next reward is one drop away
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-primary-foreground/85">
            Join thousands earning every day. It is free to start and your first drop is waiting.
          </p>
          <Button render={<Link href="/signup" />} nativeButton={false} size="lg" variant="secondary" className="mt-8 rounded-full">
            Create your account
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
