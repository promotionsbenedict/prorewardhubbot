"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { activityLog, profile, withdrawal } from "@/lib/db/schema"
import { makeReferralCode } from "@/lib/dashboard"
import { MIN_WITHDRAWAL, WITHDRAWAL_METHODS, pointsToUsd } from "@/lib/wallet"
import { sendWithdrawalRequested } from "@/lib/email"

export type ActionResult = { ok: boolean; message?: string }

async function requireSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

async function ensureProfile(userId: string, name: string) {
  const rows = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  if (rows.length) return rows[0]
  const inserted = await db
    .insert(profile)
    .values({ userId, referralCode: makeReferralCode(name) })
    .onConflictDoNothing({ target: profile.userId })
    .returning()
  if (inserted.length) return inserted[0]
  const again = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  return again[0]
}

export async function requestWithdrawal(input: {
  amount: number
  method: string
  destination: string
}): Promise<ActionResult> {
  const sessionUser = await requireSessionUser()

  const amount = Math.trunc(Number(input.amount))
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Enter a valid amount." }
  }
  if (amount < MIN_WITHDRAWAL) {
    return { ok: false, message: `Minimum withdrawal is ${MIN_WITHDRAWAL} points.` }
  }
  if (!WITHDRAWAL_METHODS.includes(input.method as (typeof WITHDRAWAL_METHODS)[number])) {
    return { ok: false, message: "Choose a valid payout method." }
  }
  const destination = input.destination.trim()
  if (destination.length < 3) {
    return { ok: false, message: "Enter a valid payout destination." }
  }

  // Escrow the points: deduct now, refund on rejection. Re-read inside the
  // request so the balance check uses the authoritative server value.
  const prof = await ensureProfile(sessionUser.id, sessionUser.name)
  if (prof.points < amount) {
    return { ok: false, message: "You don't have enough points for this withdrawal." }
  }

  await db
    .update(profile)
    .set({ points: prof.points - amount })
    .where(eq(profile.userId, sessionUser.id))

  const [created] = await db
    .insert(withdrawal)
    .values({
      userId: sessionUser.id,
      amount,
      method: input.method,
      destination,
      status: "Pending",
    })
    .returning({ id: withdrawal.id })

  await db.insert(activityLog).values({
    userId: sessionUser.id,
    icon: "points",
    title: "Withdrawal requested",
    meta: `${input.method} · ${pointsToUsd(amount)}`,
    amount: `-${amount}`,
  })

  if (sessionUser.email && created) {
    await sendWithdrawalRequested({
      to: sessionUser.email,
      name: sessionUser.name,
      amount,
      method: input.method,
      withdrawalId: created.id,
    })
  }

  revalidatePath("/app/wallet")
  revalidatePath("/app")
  return { ok: true }
}
