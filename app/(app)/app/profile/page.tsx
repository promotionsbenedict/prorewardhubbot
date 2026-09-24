import type { Metadata } from "next"
import Link from "next/link"
import { Gauge, Send, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/auth/logout-button"
import { AchievementsGrid } from "@/components/dashboard/achievements-grid"
import { LevelTrack } from "@/components/dashboard/level-track"
import { getDashboardData } from "@/lib/dashboard"

export const metadata: Metadata = {
  title: "Profile",
  description: "Your level, achievements, and account.",
}

export default async function ProfilePage() {
  const { user, achievements } = await getDashboardData()
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/12 via-card to-accent/10 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-xl font-bold text-primary-foreground">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {user.handle} · Member since {user.memberSince}
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-background/70 p-3 text-center">
            <p className="font-display text-lg font-bold text-foreground">{user.points.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Points</p>
          </div>
          <div className="rounded-xl bg-background/70 p-3 text-center">
            <p className="font-display text-lg font-bold text-foreground">{user.xp.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">XP</p>
          </div>
          <div className="rounded-xl bg-background/70 p-3 text-center">
            <p className="font-display text-lg font-bold text-foreground">{user.streak}</p>
            <p className="text-[11px] text-muted-foreground">Day streak</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="size-5 text-success" />
            <h2 className="font-display text-base font-bold text-foreground">Pro Score</h2>
          </div>
          <span className="font-display text-lg font-bold text-foreground">{user.proScore}/100</span>
        </div>
        <Progress value={user.proScore} className="mt-3 h-2.5" />
        <p className="mt-2 text-xs text-muted-foreground">
          Your Pro Score reflects consistency, mission quality, and referral activity. Keep it high to unlock premium
          rewards and priority in prize pools.
        </p>
      </div>

      <LevelTrack xp={user.xp} />

      {!user.telegramConnected && (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
            <Send className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Connect Telegram</p>
            <p className="text-xs text-muted-foreground">Get Daily Drop reminders and complete Telegram missions.</p>
          </div>
          <Button size="sm" className="shrink-0 rounded-full">
            Connect
          </Button>
        </div>
      )}

      <AchievementsGrid achievements={achievements} />

      <div className="rounded-2xl border border-border bg-card p-2">
        <Link
          href="/app"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Settings className="size-4.5" />
          Account settings
        </Link>
      </div>

      <div className="pt-2 text-center">
        <LogoutButton />
      </div>
    </div>
  )
}
