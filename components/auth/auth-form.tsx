"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { claimReferral } from "@/app/actions/dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "sign-in" | "sign-up"

export function AuthForm({ mode, referralCode }: { mode: Mode; referralCode?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") || "").trim()
    const password = String(form.get("password") || "")
    const name = String(form.get("name") || "").trim()

    if (mode === "sign-up" && name.length < 2) {
      setError("Please enter your name.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    try {
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({ email, password, name })
        if (error) {
          setError(error.message || "Could not create your account.")
          return
        }
        if (referralCode) {
          try {
            await claimReferral(referralCode)
          } catch {
            // A failed referral link should never block account creation.
          }
        }
      } else {
        const { error } = await authClient.signIn.email({ email, password })
        if (error) {
          setError("Incorrect email or password.")
          return
        }
      }
      router.push("/app")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {mode === "sign-up" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Alex Rivera" required />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {mode === "sign-in" && (
            <Link href="/support" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          placeholder={mode === "sign-up" ? "At least 8 characters" : "••••••••"}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="mt-1 h-11 rounded-full text-sm font-semibold">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {mode === "sign-up" ? "Create account" : "Log in"}
      </Button>

      {mode === "sign-up" && (
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </form>
  )
}
