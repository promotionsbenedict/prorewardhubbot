import { Coins, Flame, Gauge, Sparkles } from "lucide-react"
import type { LiveUser } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

export function StatTiles({ user }: { user: LiveUser }) {
  const tiles = [
    { label: "Points", value: user.points.toLocaleString(), icon: Coins, tone: "text-primary bg-primary/12" },
    { label: "XP", value: user.xp.toLocaleString(), icon: Sparkles, tone: "text-accent bg-accent/12" },
    { label: "Streak", value: `${user.streak} days`, icon: Flame, tone: "text-warning bg-warning/12" },
    { label: "Pro Score", value: user.proScore, icon: Gauge, tone: "text-success bg-success/12" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-border bg-card p-4">
          <span className={cn("grid size-9 place-items-center rounded-lg", t.tone)}>
            <t.icon className="size-4.5" />
          </span>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{t.value}</p>
          <p className="text-xs text-muted-foreground">{t.label}</p>
        </div>
      ))}
    </div>
  )
}
