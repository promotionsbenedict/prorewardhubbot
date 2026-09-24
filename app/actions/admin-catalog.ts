"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { achievement, mission, streakMilestone, user } from "@/lib/db/schema"

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

function revalidateCatalog() {
  revalidatePath("/admin/catalog")
  revalidatePath("/app")
  revalidatePath("/app/missions")
  revalidatePath("/app/achievements")
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : ""
}

function int(v: FormDataEntryValue | null, fallback = 0): number {
  const n = Number.parseInt(str(v), 10)
  return Number.isFinite(n) ? n : fallback
}

function slugId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// --- Missions --------------------------------------------------------------

export async function saveMission(formData: FormData): Promise<ActionResult> {
  await requireAdminUser()

  const id = str(formData.get("id"))
  const title = str(formData.get("title"))
  const description = str(formData.get("description"))
  if (!title || !description) {
    return { ok: false, message: "Title and description are required." }
  }

  const durationRaw = str(formData.get("durationSeconds"))
  const values = {
    type: str(formData.get("type")) || "custom",
    title,
    description,
    points: int(formData.get("points")),
    xp: int(formData.get("xp")),
    required: str(formData.get("required")) === "on",
    cta: str(formData.get("cta")) || "Start",
    verification: str(formData.get("verification")) || "instant",
    durationSeconds: durationRaw ? int(formData.get("durationSeconds")) : null,
    sortOrder: int(formData.get("sortOrder")),
    active: str(formData.get("active")) === "on",
  }

  if (id) {
    await db.update(mission).set(values).where(eq(mission.id, id))
  } else {
    await db.insert(mission).values({ id: slugId("m"), ...values })
  }

  revalidateCatalog()
  return { ok: true }
}

export async function deleteMission(id: string): Promise<ActionResult> {
  await requireAdminUser()
  await db.delete(mission).where(eq(mission.id, id))
  revalidateCatalog()
  return { ok: true }
}

// --- Achievements ----------------------------------------------------------

export async function saveAchievement(formData: FormData): Promise<ActionResult> {
  await requireAdminUser()

  const id = str(formData.get("id"))
  const title = str(formData.get("title"))
  const description = str(formData.get("description"))
  if (!title || !description) {
    return { ok: false, message: "Title and description are required." }
  }

  const values = {
    title,
    description,
    icon: str(formData.get("icon")) || "Trophy",
    points: int(formData.get("points")),
    goal: Math.max(1, int(formData.get("goal"), 1)),
    metric: str(formData.get("metric")) || "points",
    sortOrder: int(formData.get("sortOrder")),
    active: str(formData.get("active")) === "on",
  }

  if (id) {
    await db.update(achievement).set(values).where(eq(achievement.id, id))
  } else {
    await db.insert(achievement).values({ id: slugId("a"), ...values })
  }

  revalidateCatalog()
  return { ok: true }
}

export async function deleteAchievement(id: string): Promise<ActionResult> {
  await requireAdminUser()
  await db.delete(achievement).where(eq(achievement.id, id))
  revalidateCatalog()
  return { ok: true }
}

// --- Streak milestones -----------------------------------------------------

export async function saveStreakMilestone(formData: FormData): Promise<ActionResult> {
  await requireAdminUser()

  const id = str(formData.get("id"))
  const label = str(formData.get("label"))
  if (!label) {
    return { ok: false, message: "Label is required." }
  }

  const values = {
    day: Math.max(1, int(formData.get("day"), 1)),
    reward: int(formData.get("reward")),
    label,
    sortOrder: int(formData.get("sortOrder")),
    active: str(formData.get("active")) === "on",
  }

  if (id) {
    await db.update(streakMilestone).set(values).where(eq(streakMilestone.id, id))
  } else {
    await db.insert(streakMilestone).values({ id: slugId("s"), ...values })
  }

  revalidateCatalog()
  return { ok: true }
}

export async function deleteStreakMilestone(id: string): Promise<ActionResult> {
  await requireAdminUser()
  await db.delete(streakMilestone).where(eq(streakMilestone.id, id))
  revalidateCatalog()
  return { ok: true }
}
