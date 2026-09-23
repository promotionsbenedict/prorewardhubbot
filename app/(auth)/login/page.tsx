import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Separator } from "@/components/ui/separator"
import { AuthShell } from "@/components/marketing/auth-shell"
import { AuthForm } from "@/components/auth/auth-form"
import { TelegramSection } from "@/components/auth/telegram-section"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Pro Reward Hub account.",
}

const TELEGRAM_ERRORS: Record<string, string> = {
  telegram_invalid: "We couldn't verify your Telegram login. Please try again.",
  telegram_expired: "That Telegram login link expired. Please try again.",
  telegram_failed: "Telegram sign-in failed. Please try again or use your email.",
  telegram_unavailable: "Telegram login isn't available right now.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/app")

  const { error } = await searchParams
  const telegramError = error ? TELEGRAM_ERRORS[error] : null

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to open today's Daily Drop and keep your streak alive."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {telegramError && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            {telegramError}
          </p>
        )}
        <TelegramSection label="Continue with Telegram" />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <AuthForm mode="sign-in" />
      </div>
    </AuthShell>
  )
}
