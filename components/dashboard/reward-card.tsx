"use client"

import { useState, useTransition } from "react"
import {
  Banknote,
  Gift,
  Loader2,
  Lock,
  Package,
  Phone,
  Sparkles,
  Ticket,
  Tv,
  Users,
  Wifi,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { redeemReward } from "@/app/actions/dashboard"
import type { Reward, RewardCategory, RewardStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const categoryIcon: Record<RewardCategory, React.ComponentType<{ className?: string }>> = {
  Airtime: Phone,
  Data: Wifi,
  Cash: Banknote,
  Voucher: Ticket,
  Subscription: Tv,
  Code: Sparkles,
  Physical: Package,
  Mystery: Gift,
  "Prize Pool": Users,
}

const statusStyle: Record<RewardStatus, string> = {
  Locked: "bg-muted text-muted-foreground",
  Eligible: "bg-success/15 text-success",
  Pending: "bg-warning/15 text-warning",
  Awarded: "bg-primary/15 text-primary",
  Claimed: "bg-muted text-muted-foreground",
  Expired: "bg-destructive/15 text-destructive",
}

export function RewardCard({ reward }: { reward: Reward }) {
  const Icon = categoryIcon[reward.category]
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const locked = reward.status === "Locked"
  const canClaim = reward.status === "Awarded" || reward.status === "Eligible"

  function handleRedeem() {
    setError(null)
    startTransition(async () => {
      const res = await redeemReward(reward.id)
      if (!res.ok) setError(res.message ?? "Something went wrong")
    })
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors",
        locked && "opacity-80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl",
            locked ? "bg-muted text-muted-foreground" : "bg-primary/12 text-primary",
          )}
        >
          {locked ? <Lock className="size-5" /> : <Icon className="size-5" />}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            statusStyle[reward.status],
          )}
        >
          {reward.status}
        </span>
      </div>

      <div className="mt-3 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-bold text-foreground">{reward.name}</h3>
          <span className="shrink-0 font-display text-sm font-bold text-primary">{reward.value}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{reward.description}</p>
      </div>

      {typeof reward.spotsLeft === "number" && typeof reward.totalSpots === "number" && (
        <div className="mt-3">
          <Progress value={((reward.totalSpots - reward.spotsLeft) / reward.totalSpots) * 100} className="h-1.5" />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {reward.spotsLeft.toLocaleString()} of {reward.totalSpots.toLocaleString()} spots left
            {reward.expiresIn ? ` · ${reward.expiresIn} left` : ""}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="min-w-0">
          <span className="block truncate text-xs text-muted-foreground">{reward.requirement}</span>
          {error && <span className="text-[11px] text-destructive">{error}</span>}
        </div>
        <Button
          size="sm"
          variant={canClaim ? "default" : "outline"}
          disabled={!canClaim || isPending}
          onClick={handleRedeem}
          className="shrink-0 rounded-full"
        >
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          {reward.status === "Pending"
            ? "Requested"
            : reward.status === "Awarded"
              ? "Claim"
              : reward.status === "Eligible"
                ? "Redeem"
                : "Locked"}
        </Button>
      </div>
    </div>
  )
}
