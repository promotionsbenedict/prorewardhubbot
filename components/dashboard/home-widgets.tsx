import Link from "next/link"
import { ArrowRight, Clock, Flame, Gift, Sparkles, Timer, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { communityDrop, featuredMission, streakMilestones, surpriseDrop } from "@/lib/data"
import type { ActivityItem } from "@/lib/types"
import { cn } from "@/lib/utils"

export function SurpriseDropBanner() {
  if (!surpriseDrop.active) return null
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/15 to-primary/10 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
        <Sparkles className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{surpriseDrop.title}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
            <Timer className="size-3" />
            {surpriseDrop.minutesLeft}m left
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{surpriseDrop.description}</p>
      </div>
      <Button size="sm" className="shrink-0 rounded-full">
        +{surpriseDrop.points}
      </Button>
    </div>
  )
}

export function FeaturedMissionCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
        <Trophy className="size-3.5" />
        {featuredMission.tag}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold text-foreground">{featuredMission.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{featuredMission.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="text-primary">+{featuredMission.points} pts</span>
          <span className="text-muted-foreground">+{featuredMission.xp} XP</span>
        </div>
        <Button size="sm" className="rounded-full">
          Discover
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Flame className="size-5 text-warning" />
        <h3 className="font-display text-base font-bold text-foreground">{streak}-day streak</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Hit milestones to unlock bonus rewards.</p>
      <div className="mt-4 space-y-3">
        {streakMilestones.map((m) => (
          <div key={m.day} className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                m.reached ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground",
              )}
            >
              {m.day}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.reward}</p>
            </div>
            {m.reached && <span className="text-xs font-medium text-success">Reached</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CommunityDropCard() {
  const pct = Math.round((communityDrop.current / communityDrop.target) * 100)
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-primary" />
        <h3 className="font-display text-base font-bold text-foreground">{communityDrop.title}</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{communityDrop.description}</p>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={pct} className="h-2 flex-1" />
        <span className="text-sm font-semibold text-foreground">{pct}%</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {communityDrop.current.toLocaleString()} / {communityDrop.target.toLocaleString()} {communityDrop.unit}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" />
          {communityDrop.endsIn} left
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
        <Gift className="size-4 shrink-0 text-accent" />
        {communityDrop.reward}
      </div>
    </div>
  )
}

const activityTone: Record<ActivityItem["icon"], string> = {
  points: "bg-primary/12 text-primary",
  xp: "bg-accent/12 text-accent",
  streak: "bg-warning/12 text-warning",
  reward: "bg-success/12 text-success",
  referral: "bg-primary/12 text-primary",
  achievement: "bg-accent/12 text-accent",
}

const activityIcon: Record<ActivityItem["icon"], React.ComponentType<{ className?: string }>> = {
  points: Sparkles,
  xp: Sparkles,
  streak: Flame,
  reward: Gift,
  referral: Users,
  achievement: Trophy,
}

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground">Recent activity</h3>
        <Link href="/app/profile" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4 space-y-1">
        {activity.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No activity yet — complete a mission to get started.
          </p>
        )}
        {activity.map((a) => {
          const Icon = activityIcon[a.icon]
          return (
            <div key={a.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", activityTone[a.icon])}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {a.meta} · {a.time}
                </p>
              </div>
              {a.amount && <span className="shrink-0 text-sm font-semibold text-primary">{a.amount}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
