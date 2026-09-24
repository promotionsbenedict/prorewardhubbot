import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownToLine } from "lucide-react"
import { WithdrawalActions } from "@/components/admin/withdrawal-actions"
import { getAdminWithdrawals } from "@/lib/admin"
import { pointsToUsd } from "@/lib/wallet"

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
  if (status === "Paid") {
    return <Badge className="bg-success/15 text-success">Paid</Badge>
  }
  if (status === "Rejected") {
    return <Badge variant="secondary">Rejected</Badge>
  }
  return <Badge variant="secondary">{status}</Badge>
}

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getAdminWithdrawals()
  const pending = withdrawals.filter((w) => w.status === "Pending")
  const resolved = withdrawals.filter((w) => w.status !== "Pending")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Withdrawals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review payout requests. {pending.length} pending · {resolved.length} resolved.
        </p>
      </div>

      {withdrawals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ArrowDownToLine className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-foreground">No withdrawals yet</p>
            <p className="text-sm text-muted-foreground">
              Payout requests from members will appear here for review.
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
                {pending.map((w) => (
                  <Card
                    key={w.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ArrowDownToLine className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {w.amount.toLocaleString()} pts{" "}
                          <span className="font-normal text-muted-foreground">
                            · {pointsToUsd(w.amount)} · {w.method}
                          </span>
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {w.userName ?? "Unknown"} · {w.destination}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {w.userEmail ?? "—"} · {formatDate(w.createdAt)}
                        </p>
                      </div>
                    </div>
                    <WithdrawalActions id={w.id} />
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
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Member</th>
                      <th className="px-5 py-3 font-medium">Method</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolved.map((w) => (
                      <tr key={w.id} className="border-b border-border/40 last:border-0">
                        <td className="px-5 py-4 font-medium text-foreground">
                          {w.amount.toLocaleString()} pts
                          <span className="block text-xs font-normal text-muted-foreground">
                            {pointsToUsd(w.amount)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <span className="block text-foreground">{w.userName ?? "Unknown"}</span>
                          <span className="text-xs">{w.userEmail ?? "—"}</span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{w.method}</td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDate(w.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <StatusBadge status={w.status} />
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
