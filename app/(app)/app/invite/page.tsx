import type { Metadata } from "next"
import { InviteContent } from "@/components/dashboard/invite-content"
import { getDashboardData, getReferralData } from "@/lib/dashboard"

export const metadata: Metadata = {
  title: "Invite",
  description: "Invite friends and earn bonus Points when they get active.",
}

export default async function InvitePage() {
  const [{ user }, { referrals, stats }] = await Promise.all([getDashboardData(), getReferralData()])
  return <InviteContent referralCode={user.referralCode} referrals={referrals} stats={stats} />
}
