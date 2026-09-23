import type { Metadata } from "next"
import Link from "next/link"
import { Banknote, Gift, Package, Phone, Play, Sparkles, Ticket, Trophy, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHero } from "@/components/marketing/page-hero"
import { rewards } from "@/lib/data"
import type { RewardCategory } from "@/lib/types"

export const metadata: Metadata = {
  title: "Rewards",
  description:
    "Explore the rewards you can claim on Pro Reward Hub: airtime, data, cash, vouchers, subscriptions, mystery boxes, and shared prize pools.",
}

const categoryMeta: Record<RewardCategory, { icon: typeof Gift; blurb: string }> = {
  Airtime: { icon: Phone, blurb: "Instant mobile top-ups" },
  Data: { icon: Wifi, blurb: "Mobile data bundles" },
  Cash: { icon: Banknote, blurb: "Direct cash payouts" },
  Voucher: { icon: Ticket, blurb: "Store & gift vouchers" },
  Subscription: { icon: Play, blurb: "Streaming & app passes" },
  Code: { icon: Sparkles, blurb: "Redeemable promo codes" },
  Physical: { icon: Package, blurb: "Merch & physical goods" },
  Mystery: { icon: Gift, blurb: "Surprise reward boxes" },
  "Prize Pool": { icon: Trophy, blurb: "Shared community draws" },
}

const categories = Object.keys(categoryMeta) as RewardCategory[]

export default function RewardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Rewards"
        title="Rewards worth showing up for"
        subtitle="Turn Points into real value. Every reward is verified and delivered — no gimmicks, no dead ends."
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Reward categories</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const meta = categoryMeta[cat]
            return (
              <div key={cat} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <meta.icon className="size-5" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-foreground">{cat}</p>
                  <p className="text-sm text-muted-foreground">{meta.blurb}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Featured rewards</h2>
              <p className="mt-2 text-muted-foreground">A sample of what members are claiming right now.</p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              Updated daily
            </Badge>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => {
              const meta = categoryMeta[reward.category]
              return (
                <div
                  key={reward.id}
                  className="flex flex-col rounded-2xl border border-border bg-background p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-accent">
                      <meta.icon className="size-5" />
                    </span>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {reward.category}
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{reward.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{reward.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="font-display text-lg font-bold text-foreground">{reward.value}</span>
                    <span className="text-xs text-muted-foreground">{reward.requirement}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-border bg-background p-10 text-center">
            <h3 className="font-display text-xl font-bold text-foreground">Start earning toward your first reward</h3>
            <p className="max-w-md text-muted-foreground">
              Create a free account and complete today&apos;s Daily Drop to begin building your Points balance.
            </p>
            <Button render={<Link href="/signup" />} nativeButton={false} size="lg" className="rounded-full">
              Join Pro Reward Hub
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
