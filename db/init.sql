-- Pro Reward Hub - database schema
-- This mirrors lib/db/schema.ts exactly. Postgres runs every .sql file in
-- /docker-entrypoint-initdb.d automatically the FIRST time the data volume is
-- created (i.e. on a brand-new database). It is safe to run again by hand
-- because every statement uses IF NOT EXISTS.
--
-- Column names are camelCase and quoted to match Better Auth's defaults.

-- ============================ Better Auth tables ============================

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "role" text NOT NULL DEFAULT 'user',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

-- ================================ App tables ================================

CREATE TABLE IF NOT EXISTS "profile" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL UNIQUE,
  "points" integer NOT NULL DEFAULT 0,
  "xp" integer NOT NULL DEFAULT 0,
  "streak" integer NOT NULL DEFAULT 0,
  "telegramConnected" boolean NOT NULL DEFAULT false,
  "referralCode" text NOT NULL,
  "lastCheckIn" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "mission_completion" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "missionId" text NOT NULL,
  "points" integer NOT NULL DEFAULT 0,
  "xp" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "redemption" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "rewardId" text NOT NULL,
  "rewardName" text NOT NULL,
  "cost" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'Pending',
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "withdrawal" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "amount" integer NOT NULL,
  "method" text NOT NULL,
  "destination" text NOT NULL,
  "status" text NOT NULL DEFAULT 'Pending',
  "note" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "resolvedAt" timestamp
);

CREATE TABLE IF NOT EXISTS "activity_log" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "icon" text NOT NULL,
  "title" text NOT NULL,
  "meta" text NOT NULL,
  "amount" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

-- Helpful indexes for the per-user scoped queries the app runs.
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "mission_completion_userId_idx" ON "mission_completion" ("userId");
CREATE INDEX IF NOT EXISTS "redemption_userId_idx" ON "redemption" ("userId");
CREATE INDEX IF NOT EXISTS "withdrawal_userId_idx" ON "withdrawal" ("userId");
CREATE INDEX IF NOT EXISTS "activity_log_userId_idx" ON "activity_log" ("userId");
