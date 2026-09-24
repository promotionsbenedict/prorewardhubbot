import { redirect } from "next/navigation"

// A shareable referral entry point: /join/CODE forwards to signup with the
// referral code attached so it can be claimed after the account is created.
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  redirect(`/signup?ref=${encodeURIComponent(code)}`)
}
