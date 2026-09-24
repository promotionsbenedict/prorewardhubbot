import { levelInfo } from "@/lib/data"

export function LevelBadge({ xp }: { xp: number }) {
  const { current, next, progress, toNext } = levelInfo(xp)
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-background"
          style={{ backgroundColor: current.color }}
        >
          {current.name[0]}
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-foreground">{current.name}</p>
          <p className="truncate text-xs text-muted-foreground">{xp.toLocaleString()} XP</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {next ? `${toNext.toLocaleString()} XP to ${next.name}` : "Max level reached"}
      </p>
    </div>
  )
}
