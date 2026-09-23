import { Check } from "lucide-react"
import { levelInfo, levels } from "@/lib/data"
import { cn } from "@/lib/utils"

export function LevelTrack({ xp }: { xp: number }) {
  const { current, next, progress, toNext } = levelInfo(xp)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-foreground">Level progression</h2>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold text-background"
          style={{ backgroundColor: current.color }}
        >
          {current.name}
        </span>
      </div>

      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {next ? `${toNext.toLocaleString()} XP to reach ${next.name}` : "You've reached the top level!"}
        </p>
      </div>

      <div className="mt-5 space-y-1">
        {levels.map((lvl) => {
          const reached = xp >= lvl.minXp
          const isCurrent = lvl.name === current.name
          return (
            <div
              key={lvl.name}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-2.5",
                isCurrent && "bg-muted/60",
              )}
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-background"
                style={{ backgroundColor: reached ? lvl.color : "var(--muted)" }}
              >
                {reached ? <Check className="size-4" /> : lvl.name[0]}
              </span>
              <div className="flex-1">
                <p className={cn("text-sm font-medium", reached ? "text-foreground" : "text-muted-foreground")}>
                  {lvl.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{lvl.minXp.toLocaleString()} XP</p>
              </div>
              {isCurrent && <span className="text-xs font-semibold text-primary">Current</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
