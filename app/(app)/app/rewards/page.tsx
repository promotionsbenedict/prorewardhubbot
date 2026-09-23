import type { Metadata } from "next"
import { Gauge, Sparkles } from "lucide-react"
import { RewardCard } from "@/components/dashboard/reward-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { getDashboardData } from "@/lib/dashboard"

export const metadata: Metadata = {
  title: "Rewards",
  description: "Browse and claim your earned rewards.",
}

export default async function RewardsPage() {
  const { user, rewards } = await getDashboardData()
  const available = rewards.filter((r) => r.status === "Eligible" || r.status === "Awarded")
  const pending = rewards.filter((r) => r.status === "Pending")
  const locked = rewards.filter((r) => r.status === "Locked")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Rewards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Redeem Points for real rewards. Higher levels and Pro Score unlock better prizes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Points balance
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{user.points.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Gauge className="size-4 text-success" />
              Pro Score
            </span>
            <span className="font-semibold text-foreground">{user.proScore}/100</span>
          </div>
          <Progress value={user.proScore} className="mt-3 h-2" />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Higher Pro Score means priority for high-value rewards.
          </p>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="locked">Locked</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="mt-4 grid gap-3 sm:grid-cols-2">
          {available.map((r) => (
            <RewardCard key={r.id} reward={r} />
          ))}
        </TabsContent>
        <TabsContent value="pending" className="mt-4 grid gap-3 sm:grid-cols-2">
          {pending.length > 0 ? (
            pending.map((r) => <RewardCard key={r.id} reward={r} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground sm:col-span-2">
              Nothing pending right now.
            </p>
          )}
        </TabsContent>
        <TabsContent value="locked" className="mt-4 grid gap-3 sm:grid-cols-2">
          {locked.map((r) => (
            <RewardCard key={r.id} reward={r} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
