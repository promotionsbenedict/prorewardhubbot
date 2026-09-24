import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Per-user state. Every table carries a plain `userId` for scoping (no FK by
// design, so the schema stays easy to iterate on). Catalog definitions
// (missions, rewards, levels, achievements) live in lib/data.ts.

// One row per user: the core reward-economy counters.
export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  points: integer("points").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  telegramConnected: boolean("telegramConnected").notNull().default(false),
  referralCode: text("referralCode").notNull(),
  referredBy: text("referredBy"),
  lastCheckIn: timestamp("lastCheckIn"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// One row per completed mission (daily drop or standalone).
export const missionCompletion = pgTable("mission_completion", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  missionId: text("missionId").notNull(),
  points: integer("points").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// One row per reward the user has redeemed.
export const redemption = pgTable("redemption", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  rewardId: text("rewardId").notNull(),
  rewardName: text("rewardName").notNull(),
  cost: integer("cost").notNull().default(0),
  status: text("status").notNull().default("Pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// One row per point-withdrawal request. Points are escrowed (deducted) at
// request time and refunded if the request is rejected.
export const withdrawal = pgTable("withdrawal", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("Pending"),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  resolvedAt: timestamp("resolvedAt"),
})

// --- Catalog tables --------------------------------------------------------
// Admin-managed definitions (previously hardcoded in lib/data.ts). These are
// global, not per-user, and are edited from the admin panel.

// Daily-drop / standalone mission definitions.
export const mission = pgTable("mission", {
  id: text("id").primaryKey(),
  type: text("type").notNull().default("custom"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  required: boolean("required").notNull().default(false),
  cta: text("cta").notNull().default("Start"),
  verification: text("verification").notNull().default("instant"),
  durationSeconds: integer("durationSeconds").notNull().default(0),
  sortOrder: integer("sortOrder").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Achievement definitions surfaced on the achievements page.
export const achievement = pgTable("achievement", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("Trophy"),
  points: integer("points").notNull().default(0),
  goal: integer("goal").notNull().default(1),
  metric: text("metric").notNull().default("points"),
  sortOrder: integer("sortOrder").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Streak-milestone definitions rendered on the home streak widget.
export const streakMilestone = pgTable("streak_milestone", {
  id: text("id").primaryKey(),
  day: integer("day").notNull(),
  reward: integer("reward").notNull().default(0),
  label: text("label").notNull(),
  sortOrder: integer("sortOrder").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Append-only feed of notable events for the activity list.
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  icon: text("icon").notNull(),
  title: text("title").notNull(),
  meta: text("meta").notNull(),
  amount: text("amount"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
