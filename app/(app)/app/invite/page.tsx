import type { Metadata } from "next"
import { InviteContent } from "@/components/dashboard/invite-content"
import { getDashboardData } from "@/lib/dashboard"

export const metadata: Metadata = {
  title: "Invite",
  description: "Invite friends and earn bonus Points when they get active.",
}

export default async function InvitePage() {
  const { user } = await getDashboardData()
  return <InviteContent referralCode={user.referralCode} />
}
