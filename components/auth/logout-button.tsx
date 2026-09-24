"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function LogoutButton({
  className,
  variant = "outline",
}: {
  className?: string
  variant?: "outline" | "ghost" | "default"
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button onClick={onClick} disabled={loading} variant={variant} className={className}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      Log out
    </Button>
  )
}
