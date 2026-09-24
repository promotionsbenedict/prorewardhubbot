import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift } from "lucide-react"
import { RedemptionActions } from "@/components/admin/redemption-actions"
import { getAdminRedemptions } from "@/lib/admin"

export const dynamic = "force-dynamic"

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Pending") {
    return <Badge className="bg-warning/15 text-warning">Pending</Badge>
  }
  if (status === "Fulfilled") {
    return <Badge className="bg-success/15 text-success">Fulfilled</Badge>
  }
  if (status === "Rejected") {
    return <Badge variant="secondary">Rejected</Badge>
  }
  return <Badge variant="secondary">{status}</Badge>
}

export default async function AdminRedemptionsPage() {
  const redemptions = await getAdminRedemptions()
  const pending = redemptions.filter((r) => r.status === "Pending")
  const resolved = redemptions.filter((r) => r.status !== "Pending")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Redemptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review reward requests. {pending.length} pending ·{" "}
          {resolved.length} resolved.
        </p>
      </div>

      {redemptions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Gift className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-foreground">No redemptions yet</p>
            <p className="text-sm text-muted-foreground">
              Reward requests from members will appear here for review.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Awaiting review
              </h2>
              <div className="space-y-3">
                {pending.map((r) => (
                  <Card key={r.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Gift className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{r.rewardName}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {r.userName ?? "Unknown"} · {r.userEmail ?? "—"} · {formatDate(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    <RedemptionActions id={r.id} />
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {resolved.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                History
              </h2>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Reward</th>
                      <th className="px-5 py-3 font-medium">Member</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolved.map((r) => (
                      <tr key={r.id} className="border-b border-border/40 last:border-0">
                        <td className="px-5 py-4 font-medium text-foreground">{r.rewardName}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <span className="block text-foreground">{r.userName ?? "Unknown"}</span>
                          <span className="text-xs">{r.userEmail ?? "—"}</span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDate(r.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
