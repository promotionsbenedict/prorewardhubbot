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
  title: "Sign Up",
  description: "Create your free Pro Reward Hub account and start earning.",
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/app")

  const { ref } = await searchParams

  return (
    <AuthShell
      title="Create your account"
      subtitle="It's free. Complete today's drop and start your streak in minutes."
      footer={
        <>
          Already a member?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <TelegramSection label="Sign up with Telegram" />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <AuthForm mode="sign-up" referralCode={ref} />
      </div>
    </AuthShell>
  )
}
