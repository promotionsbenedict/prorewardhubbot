"use client"

import { useState, useTransition } from "react"
import { ShieldCheck, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adjustUserPoints, setUserRole } from "@/app/actions/admin"

export function UserRowActions({
  userId,
  role,
  isSelf,
}: {
  userId: string
  role: string
  isSelf: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)

  function toggleRole() {
    setError(null)
    const next = role === "admin" ? "user" : "admin"
    startTransition(async () => {
      const res = await setUserRole(userId, next)
      if (!res.ok) setError(res.message ?? "Failed")
    })
  }

  function applyPoints(sign: 1 | -1) {
    setError(null)
    const value = Number.parseInt(amount, 10)
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a positive number.")
      return
    }
    startTransition(async () => {
      const res = await adjustUserPoints(userId, sign * value)
      if (res.ok) setAmount("")
      else setError(res.message ?? "Failed")
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={1}
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Points"
          aria-label="Points to adjust"
          className="h-8 w-24"
          disabled={pending}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5"
          onClick={() => applyPoints(1)}
          disabled={pending}
          aria-label="Add points"
        >
          +
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5"
          onClick={() => applyPoints(-1)}
          disabled={pending}
          aria-label="Subtract points"
        >
          -
        </Button>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 gap-1.5 text-xs"
        onClick={toggleRole}
        disabled={pending || isSelf}
        title={isSelf ? "You can't change your own role" : undefined}
      >
        {role === "admin" ? (
          <>
            <ShieldOff className="size-3.5" aria-hidden="true" />
            Remove admin
          </>
        ) : (
          <>
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Make admin
          </>
        )}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}
