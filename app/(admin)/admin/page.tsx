import type { ReactNode } from "react"
import Link from "next/link"
import { Users, Coins, Gift, Clock, Target, ArrowDownToLine } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdminOverview } from "@/lib/admin"

export const dynamic = "force-dynamic"

function Kpi({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: ReactNode
  accent?: boolean
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={
            accent
              ? "flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
              : "flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          }
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
    </Card>
  )
}

export default async function AdminOverviewPage() {
  const stats = await getAdminOverview()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform activity across all members of Pro Reward Hub.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Kpi
          label="Total members"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="size-4" aria-hidden="true" />}
          accent
        />
        <Kpi
          label="Points in circulation"
          value={stats.totalPoints.toLocaleString()}
          icon={<Coins className="size-4" aria-hidden="true" />}
        />
        <Kpi
          label="Pending redemptions"
          value={stats.pendingRedemptions.toLocaleString()}
          icon={<Clock className="size-4" aria-hidden="true" />}
          accent={stats.pendingRedemptions > 0}
        />
        <Kpi
          label="Total redemptions"
          value={stats.totalRedemptions.toLocaleString()}
          icon={<Gift className="size-4" aria-hidden="true" />}
        />
        <Kpi
          label="Missions completed"
          value={stats.missionsCompleted.toLocaleString()}
          icon={<Target className="size-4" aria-hidden="true" />}
        />
        <Kpi
          label="Pending withdrawals"
          value={stats.pendingWithdrawals.toLocaleString()}
          icon={<ArrowDownToLine className="size-4" aria-hidden="true" />}
          accent={stats.pendingWithdrawals > 0}
        />
      </div>

      {stats.pendingRedemptions > 0 ? (
        <Card className="flex flex-col items-start justify-between gap-4 border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Clock className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-foreground">
                {stats.pendingRedemptions} redemption
                {stats.pendingRedemptions === 1 ? "" : "s"} waiting for review
              </p>
              <p className="text-sm text-muted-foreground">
                Approve or reject reward requests from members.
              </p>
            </div>
          </div>
          <Button render={<Link href="/admin/redemptions" />} className="shrink-0">
            Review now
          </Button>
        </Card>
      ) : null}
    </div>
  )
}
