import Link from "next/link"
import { ArrowRight, Flame, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhoneMock } from "@/components/marketing/phone-mock"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-40 size-[360px] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            New Daily Drop live now
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Show up daily.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Earn real rewards.
            </span>
          </h1>
          <p className="max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
            Pro Reward Hub turns everyday actions into points, XP, and streaks. Complete Daily Drops, discover new
            projects, invite friends, and claim airtime, data, cash, and mystery rewards.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button render={<Link href="/signup" />} nativeButton={false} size="lg" className="rounded-full">
              Start earning
              <ArrowRight className="size-4" />
            </Button>
            <Button render={<Link href="/how-it-works" />} nativeButton={false} size="lg" variant="outline" className="rounded-full">
              How it works
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Flame className="size-4 text-accent" />
              120K+ streaks active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              $2.4M+ rewards claimed
            </span>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneMock />
        </div>
      </div>
    </section>
  )
}
