"use client"

import { useState, useTransition } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { approveRedemption, rejectRedemption } from "@/app/actions/admin"

export function RedemptionActions({ id }: { id: number }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(action: "approve" | "reject") {
    setError(null)
    startTransition(async () => {
      const res = action === "approve" ? await approveRedemption(id) : await rejectRedemption(id)
      if (!res.ok) setError(res.message ?? "Failed")
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success"
        onClick={() => run("approve")}
        disabled={pending}
      >
        <Check className="size-3.5" aria-hidden="true" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => run("reject")}
        disabled={pending}
      >
        <X className="size-3.5" aria-hidden="true" />
        Reject
      </Button>
    </div>
  )
}
