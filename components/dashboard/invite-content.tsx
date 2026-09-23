"use client"

import { useState } from "react"
import { Check, Copy, Gift, Share2, UserCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { referralStats, referrals } from "@/lib/data"
import type { Referral } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusStyle: Record<Referral["status"], string> = {
  Joined: "bg-muted text-muted-foreground",
  Active: "bg-primary/15 text-primary",
  Qualified: "bg-success/15 text-success",
}

export function InviteContent({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false)
  const link = `proreward.app/join/${referralCode}`

  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const mp = referralStats.missionProgress

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Invite friends</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Earn bonus Points when friends join and become active. Everyone wins.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/12 via-card to-accent/10 p-5 sm:p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Gift className="size-3.5" />
          Your referral link
        </span>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1 truncate rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground">
            {link}
          </div>
          <div className="flex gap-2">
            <Button onClick={copy} className="flex-1 rounded-full sm:flex-none">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" className="flex-1 rounded-full sm:flex-none">
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total invites", value: referralStats.total, icon: Users, tone: "text-primary bg-primary/12" },
          { label: "Active", value: referralStats.active, icon: UserCheck, tone: "text-success bg-success/12" },
          { label: "Qualified", value: referralStats.qualified, icon: Check, tone: "text-accent bg-accent/12" },
          {
            label: "Points earned",
            value: referralStats.pointsEarned.toLocaleString(),
            icon: Gift,
            tone: "text-warning bg-warning/12",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <span className={cn("grid size-9 place-items-center rounded-lg", s.tone)}>
              <s.icon className="size-4.5" />
            </span>
            <p className="mt-3 font-display text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-foreground">Referral mission</h3>
          <span className="text-sm font-semibold text-primary">
            {mp.current}/{mp.goal}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{mp.label}</p>
        <Progress value={(mp.current / mp.goal) * 100} className="mt-3 h-2" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-base font-bold text-foreground">Your crew</h3>
        <div className="mt-4 divide-y divide-border/60">
          {referrals.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {r.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">Joined {r.joinedAgo}</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", statusStyle[r.status])}>
                {r.status}
              </span>
              <span className="w-14 text-right text-sm font-semibold text-primary">+{r.pointsEarned}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
