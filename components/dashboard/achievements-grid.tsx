import { Award, Lock, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Achievement } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-foreground">Achievements</h2>
        <span className="text-xs text-muted-foreground">
          {unlocked}/{achievements.length} unlocked
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={cn(
              "flex flex-col rounded-2xl border p-4",
              a.unlocked ? "border-border bg-background" : "border-border/60 bg-muted/30",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  a.unlocked ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
                )}
              >
                {a.unlocked ? <Award className="size-5" /> : <Lock className="size-4.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-semibold", a.unlocked ? "text-foreground" : "text-muted-foreground")}>
                  {a.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
              </div>
              {a.points && (
                <span className="shrink-0 text-xs font-semibold text-primary">+{a.points}</span>
              )}
            </div>

            {!a.unlocked && typeof a.progress === "number" && typeof a.goal === "number" && (
              <div className="mt-3">
                <Progress value={(a.progress / a.goal) * 100} className="h-1.5" />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {a.progress}/{a.goal}
                </p>
              </div>
            )}

            {a.unlocked && a.shareable && (
              <Button variant="ghost" size="sm" className="mt-3 h-8 self-start rounded-full px-3 text-xs">
                <Share2 className="size-3.5" />
                Share
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
