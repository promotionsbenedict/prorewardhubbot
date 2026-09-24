"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowDownToLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { requestWithdrawal } from "@/app/actions/wallet"

const METHODS = ["PayPal", "Crypto (USDT)", "Bank transfer"] as const

const DESTINATION_HINTS: Record<string, string> = {
  PayPal: "PayPal email",
  "Crypto (USDT)": "USDT (TRC-20) wallet address",
  "Bank transfer": "Account / IBAN details",
}

export function WithdrawForm({
  balance,
  minWithdrawal,
  pointsPerUsd,
}: {
  balance: number
  minWithdrawal: number
  pointsPerUsd: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<(typeof METHODS)[number]>("PayPal")
  const [destination, setDestination] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const parsed = Number(amount)
  const usdValue =
    Number.isFinite(parsed) && parsed > 0
      ? (parsed / pointsPerUsd).toLocaleString("en-US", { style: "currency", currency: "USD" })
      : null
  const overBalance = Number.isFinite(parsed) && parsed > balance
  const canSubmit = !pending && amount !== "" && destination.trim().length >= 3 && !overBalance

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const res = await requestWithdrawal({ amount: parsed, method, destination })
      if (!res.ok) {
        setError(res.message ?? "Something went wrong.")
        return
      }
      setSuccess("Withdrawal requested. We'll review it shortly.")
      setAmount("")
      setDestination("")
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Amount (points)</Label>
          <button
            type="button"
            onClick={() => setAmount(String(balance))}
            className="text-xs font-medium text-primary hover:underline"
            disabled={balance < minWithdrawal}
          >
            Max
          </button>
        </div>
        <Input
          id="amount"
          inputMode="numeric"
          placeholder={`Min ${minWithdrawal}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          aria-describedby="amount-hint"
        />
        <p id="amount-hint" className="text-xs text-muted-foreground">
          {overBalance ? (
            <span className="text-destructive">Amount exceeds your balance.</span>
          ) : usdValue ? (
            <span>≈ {usdValue} payout</span>
          ) : (
            <span>
              {minWithdrawal} points minimum · {pointsPerUsd} points = $1
            </span>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Payout method</Label>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors",
                method === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
              aria-pressed={method === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">{DESTINATION_HINTS[method]}</Label>
        <Input
          id="destination"
          placeholder={DESTINATION_HINTS[method]}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          autoComplete="off"
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success" role="status">
          {success}
        </p>
      ) : null}

      <Button type="submit" className="w-full gap-2" disabled={!canSubmit}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowDownToLine className="size-4" aria-hidden="true" />
        )}
        Request withdrawal
      </Button>
    </form>
  )
}
