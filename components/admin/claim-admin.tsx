"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { claimAdmin } from "@/app/actions/admin"

export function ClaimAdmin({ userName }: { userName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onClaim() {
    setError(null)
    startTransition(async () => {
      const res = await claimAdmin()
      if (res.ok) {
        router.refresh()
      } else {
        setError(res.message ?? "Something went wrong.")
      }
    })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Set up the admin panel</h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          No administrator exists yet. As the first member, {userName.split(" ")[0]}, you can claim
          admin access to manage users and reward redemptions.
        </p>
        {error ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="mt-6 w-full" size="lg" onClick={onClaim} disabled={pending}>
          {pending ? "Claiming…" : "Claim admin access"}
        </Button>
      </Card>
    </div>
  )
}
