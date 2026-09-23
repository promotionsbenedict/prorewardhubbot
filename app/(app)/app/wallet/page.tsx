import { Wallet, Clock, ArrowDownToLine } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WithdrawForm } from "@/components/dashboard/withdraw-form"
import {
  getWalletData,
  pointsToUsd,
  MIN_WITHDRAWAL,
  POINTS_PER_USD,
  type WithdrawalRow,
} from "@/lib/wallet"

export const dynamic = "force-dynamic"

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Pending") return <Badge className="bg-warning/15 text-warning">Pending</Badge>
  if (status === "Approved") return <Badge className="bg-primary/15 text-primary">Approved</Badge>
  if (status === "Paid") return <Badge className="bg-success/15 text-success">Paid</Badge>
  if (status === "Rejected") return <Badge variant="secondary">Rejected</Badge>
  return <Badge variant="secondary">{status}</Badge>
}

export default async function WalletPage() {
  const { balance, pendingTotal, withdrawnTotal, withdrawals } = await getWalletData()

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24 md:pb-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert your points into real payouts.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="size-4" aria-hidden="true" />
            Available balance
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {balance.toLocaleString()} <span className="text-base font-normal text-muted-foreground">pts</span>
          </p>
          <p className="text-sm text-muted-foreground">≈ {pointsToUsd(balance)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" aria-hidden="true" />
            In review
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {pendingTotal.toLocaleString()} <span className="text-base font-normal text-muted-foreground">pts</span>
          </p>
          <p className="text-sm text-muted-foreground">≈ {pointsToUsd(pendingTotal)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowDownToLine className="size-4" aria-hidden="true" />
            Withdrawn
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {withdrawnTotal.toLocaleString()} <span className="text-base font-normal text-muted-foreground">pts</span>
          </p>
          <p className="text-sm text-muted-foreground">≈ {pointsToUsd(withdrawnTotal)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card className="h-fit p-6">
          <h2 className="text-lg font-semibold text-foreground">Request a withdrawal</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">
            Points are held while your request is reviewed.
          </p>
          <WithdrawForm
            balance={balance}
            minWithdrawal={MIN_WITHDRAWAL}
            pointsPerUsd={POINTS_PER_USD}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">History</h2>
          {withdrawals.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <ArrowDownToLine className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium text-foreground">No withdrawals yet</p>
                <p className="text-sm text-muted-foreground">
                  Your withdrawal requests will show up here.
                </p>
              </div>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border/50">
              {withdrawals.map((w: WithdrawalRow) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {w.amount.toLocaleString()} pts{" "}
                      <span className="font-normal text-muted-foreground">· {pointsToUsd(w.amount)}</span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {w.method} · {formatDate(w.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={w.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
