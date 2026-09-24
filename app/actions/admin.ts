"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { count, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { activityLog, profile, redemption, user, withdrawal } from "@/lib/db/schema"
import { sendWithdrawalPaid, sendWithdrawalRejected } from "@/lib/email"

export type ActionResult = { ok: boolean; message?: string }

async function requireAdminUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  const [me] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  if (me?.role !== "admin") throw new Error("Forbidden")
  return session.user
}

function revalidateAdmin() {
  revalidatePath("/admin")
  revalidatePath("/admin/users")
  revalidatePath("/admin/redemptions")
  revalidatePath("/admin/withdrawals")
}

// Bootstrap: the first signed-in user can claim admin, but only while no admin
// exists yet. Once an admin exists this becomes a no-op guarded server-side.
export async function claimAdmin(): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false, message: "Please sign in first." }

  const [admins] = await db.select({ c: count() }).from(user).where(eq(user.role, "admin"))
  if ((admins?.c ?? 0) > 0) {
    return { ok: false, message: "An admin already exists." }
  }

  await db.update(user).set({ role: "admin" }).where(eq(user.id, session.user.id))
  revalidateAdmin()
  return { ok: true }
}

export async function approveRedemption(id: number): Promise<ActionResult> {
  await requireAdminUser()
  await db.update(redemption).set({ status: "Fulfilled" }).where(eq(redemption.id, id))
  revalidateAdmin()
  return { ok: true }
}

export async function rejectRedemption(id: number): Promise<ActionResult> {
  await requireAdminUser()
  await db.update(redemption).set({ status: "Rejected" }).where(eq(redemption.id, id))
  revalidateAdmin()
  return { ok: true }
}

// Mark a withdrawal as paid. Points were already escrowed at request time, so
// approval simply finalizes the payout.
export async function approveWithdrawal(id: number): Promise<ActionResult> {
  await requireAdminUser()
  const [wd] = await db.select().from(withdrawal).where(eq(withdrawal.id, id)).limit(1)
  if (!wd) return { ok: false, message: "Withdrawal not found." }
  if (wd.status !== "Pending") {
    return { ok: false, message: "This withdrawal has already been resolved." }
  }

  await db
    .update(withdrawal)
    .set({ status: "Paid", resolvedAt: new Date() })
    .where(eq(withdrawal.id, id))

  await db.insert(activityLog).values({
    userId: wd.userId,
    icon: "points",
    title: "Withdrawal paid",
    meta: `${wd.method} · ${wd.amount} points`,
    amount: null,
  })

  const [recipient] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, wd.userId))
    .limit(1)
  if (recipient?.email) {
    await sendWithdrawalPaid({
      to: recipient.email,
      name: recipient.name,
      amount: wd.amount,
      method: wd.method,
      withdrawalId: wd.id,
    })
  }

  revalidateAdmin()
  revalidatePath("/app")
  revalidatePath("/app/wallet")
  return { ok: true }
}

// Reject a withdrawal and refund the escrowed points back to the member.
export async function rejectWithdrawal(id: number): Promise<ActionResult> {
  await requireAdminUser()
  const [wd] = await db.select().from(withdrawal).where(eq(withdrawal.id, id)).limit(1)
  if (!wd) return { ok: false, message: "Withdrawal not found." }
  if (wd.status !== "Pending") {
    return { ok: false, message: "This withdrawal has already been resolved." }
  }

  await db
    .update(withdrawal)
    .set({ status: "Rejected", resolvedAt: new Date() })
    .where(eq(withdrawal.id, id))

  const [prof] = await db.select().from(profile).where(eq(profile.userId, wd.userId)).limit(1)
  if (prof) {
    await db
      .update(profile)
      .set({ points: prof.points + wd.amount })
      .where(eq(profile.userId, wd.userId))
  }

  await db.insert(activityLog).values({
    userId: wd.userId,
    icon: "points",
    title: "Withdrawal rejected — points refunded",
    meta: `${wd.method} · ${wd.amount} points`,
    amount: `+${wd.amount}`,
  })

  const [recipient] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, wd.userId))
    .limit(1)
  if (recipient?.email) {
    await sendWithdrawalRejected({
      to: recipient.email,
      name: recipient.name,
      amount: wd.amount,
      method: wd.method,
      withdrawalId: wd.id,
    })
  }

  revalidateAdmin()
  revalidatePath("/app")
  revalidatePath("/app/wallet")
  return { ok: true }
}

export async function setUserRole(userId: string, role: "admin" | "user"): Promise<ActionResult> {
  const admin = await requireAdminUser()
  if (userId === admin.id && role === "user") {
    return { ok: false, message: "You can't remove your own admin access." }
  }
  await db.update(user).set({ role }).where(eq(user.id, userId))
  revalidateAdmin()
  return { ok: true }
}

export async function adjustUserPoints(userId: string, delta: number): Promise<ActionResult> {
  await requireAdminUser()
  if (!Number.isFinite(delta) || delta === 0) {
    return { ok: false, message: "Enter a non-zero amount." }
  }

  const [prof] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  if (!prof) {
    return { ok: false, message: "This user has no profile yet." }
  }

  const next = Math.max(0, prof.points + Math.trunc(delta))
  await db.update(profile).set({ points: next }).where(eq(profile.userId, userId))

  await db.insert(activityLog).values({
    userId,
    icon: "points",
    title: delta > 0 ? "Points granted by admin" : "Points adjusted by admin",
    meta: "Manual adjustment",
    amount: `${delta > 0 ? "+" : ""}${Math.trunc(delta)}`,
  })

  revalidateAdmin()
  revalidatePath("/app")
  return { ok: true }
}
