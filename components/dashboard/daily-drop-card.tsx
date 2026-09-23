import { CalendarDays, Zap } from "lucide-react"
import { MissionCard } from "@/components/dashboard/mission-card"
import { Progress } from "@/components/ui/progress"
import { dailyDrop } from "@/lib/data"
import type { Mission } from "@/lib/types"

export function DailyDropCard({ missions }: { missions: Mission[] }) {
  const total = missions.length
  const done = missions.filter((m) => m.status === "completed").length
  const requiredLeft = missions.filter((m) => m.required && m.status !== "completed").length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative border-b border-border/60 bg-gradient-to-br from-primary/12 via-card to-accent/10 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {dailyDrop.date}
            </span>
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {dailyDrop.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{dailyDrop.subtitle}</p>
          </div>
          <span className="hidden shrink-0 rounded-2xl bg-accent/15 p-3 text-accent sm:grid sm:place-items-center">
            <Zap className="size-6" />
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-sm font-semibold text-foreground">
            {done}/{total}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {requiredLeft > 0
            ? `${requiredLeft} required mission${requiredLeft > 1 ? "s" : ""} left to keep your streak`
            : "All required missions complete — streak secured!"}
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {dailyDrop.missions.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </div>
    </section>
  )
}
