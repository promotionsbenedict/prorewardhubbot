"use client"

import { useState, useTransition } from "react"
import {
  BadgeCheck,
  Check,
  CircleDot,
  Code2,
  Compass,
  HelpCircle,
  Loader2,
  MousePointerClick,
  Send,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { completeMission } from "@/app/actions/dashboard"
import type { Mission, MissionType } from "@/lib/types"
import { cn } from "@/lib/utils"

const typeIcon: Record<MissionType, React.ComponentType<{ className?: string }>> = {
  "check-in": BadgeCheck,
  visit: Compass,
  discover: Sparkles,
  telegram: Send,
  social: Share2,
  app: Smartphone,
  code: Code2,
  quiz: HelpCircle,
  custom: MousePointerClick,
}

export function MissionCard({ mission }: { mission: Mission }) {
  const Icon = typeIcon[mission.type]
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const done = mission.status === "completed"
  const inProgress = mission.status === "in-progress"

  function handleComplete() {
    setError(null)
    startTransition(async () => {
      const res = await completeMission(mission.id)
      if (!res.ok) setError(res.message ?? "Something went wrong")
    })
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3.5 transition-colors sm:p-4",
        done ? "border-border/60 bg-muted/40" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl",
          done ? "bg-success/15 text-success" : "bg-primary/12 text-primary",
        )}
      >
        {done ? <Check className="size-5" /> : <Icon className="size-5" />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("truncate text-sm font-semibold", done ? "text-muted-foreground" : "text-foreground")}>
            {mission.title}
          </p>
          {mission.required && !done && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              Required
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{mission.description}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs font-medium">
          <span className="text-primary">+{mission.points} pts</span>
          <span className="text-muted-foreground">+{mission.xp} XP</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {done ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <Check className="size-4" />
            Done
          </span>
        ) : (
          <Button
            size="sm"
            variant={inProgress ? "default" : "outline"}
            className="rounded-full"
            disabled={isPending}
            onClick={handleComplete}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              inProgress && <CircleDot className="size-3.5" />
            )}
            {isPending ? "Claiming" : mission.cta}
          </Button>
        )}
        {error && <span className="text-[11px] text-destructive">{error}</span>}
      </div>
    </div>
  )
}
