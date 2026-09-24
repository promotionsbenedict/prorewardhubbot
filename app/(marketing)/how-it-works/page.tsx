import type { Metadata } from "next"
import Link from "next/link"
import {
  Award,
  CalendarCheck,
  Coins,
  Flame,
  Gift,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/marketing/page-hero"
import { levels } from "@/lib/data"

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Pro Reward Hub works: Daily Drops, missions, Points, XP, levels, streaks, Pro Score, referrals, and rewards.",
}

const journey = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up with a phone number or email. Connect Telegram to unlock partner missions and bonus points.",
  },
  {
    icon: CalendarCheck,
    title: "Open your Daily Drop",
    body: "Every day you get a set of missions — check-ins, project visits, quizzes, code entries, and social tasks.",
  },
  {
    icon: Sparkles,
    title: "Complete missions",
    body: "Required missions keep your streak alive. Optional ones add bonus Points and XP. Everything is verified.",
  },
  {
    icon: Flame,
    title: "Grow your streak",
    body: "Show up daily to build a streak. Milestones at day 3, 7, 14, and 30 unlock escalating rewards.",
  },
  {
    icon: Award,
    title: "Level up",
    body: "XP is permanent and moves you through six levels. Higher levels signal status and unlock perks.",
  },
  {
    icon: Trophy,
    title: "Claim rewards",
    body: "Spend Points on real rewards. Your Pro Score and level determine which reward tiers you can access.",
  },
]

const concepts = [
  {
    icon: Coins,
    title: "Points vs XP",
    body: "Points are your spendable balance for rewards. XP is permanent progression that never decreases and sets your level.",
  },
  {
    icon: ShieldCheck,
    title: "Pro Score",
    body: "A trust score from 0–100 built on consistent, genuine activity. It gates premium rewards and protects the pool from abuse.",
  },
  {
    icon: Users,
    title: "Referrals",
    body: "Earn when friends join, become active, and qualify. Multi-stage rewards keep paying as your crew stays engaged.",
  },
  {
    icon: Gift,
    title: "Reward types",
    body: "Airtime, data, cash, vouchers, subscriptions, codes, physical merch, mystery boxes, and shared prize pools.",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From sign-up to real rewards"
        subtitle="Pro Reward Hub rewards one simple habit: showing up. Here is exactly how the system turns your daily activity into rewards."
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="font-display text-sm font-bold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Key concepts</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            A few ideas power the whole platform. Understand these and you understand Pro Reward Hub.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {concepts.map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-background p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">The six levels</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Earn XP to climb. Each level is a permanent badge of your consistency.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level, i) => (
            <div key={level.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <span
                className="grid size-12 place-items-center rounded-full font-display text-lg font-bold text-background"
                style={{ backgroundColor: level.color }}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-display text-base font-semibold text-foreground">{level.name}</p>
                <p className="text-sm text-muted-foreground">{level.minXp.toLocaleString()}+ XP</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-gradient-to-br from-card to-card/40 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Send className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Ready to open your first drop?</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              It is free to join. Complete today&apos;s Daily Drop and start your streak in minutes.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button render={<Link href="/signup" />} nativeButton={false} size="lg" className="rounded-full">
              Start earning
            </Button>
            <Button render={<Link href="/rewards" />} nativeButton={false} size="lg" variant="outline" className="rounded-full">
              Browse rewards
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
