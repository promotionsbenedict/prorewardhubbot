# syntax=docker/dockerfile:1

###############################################################################
# Pro Reward Hub - production image (Next.js standalone output)
###############################################################################

# ---- Base: pnpm via corepack --------------------------------------------------
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---- Dependencies -------------------------------------------------------------
FROM base AS deps
# Only the manifest + lockfile so this layer caches unless deps change.
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Build --------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so this
# one MUST be provided as a build argument (not just a runtime env var).
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ENV NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=${NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- Runner -------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output: the minimal server + only the deps it actually uses.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Static assets and the public folder are not included in standalone and must
# be copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# server.js is emitted by Next.js standalone output.
CMD ["node", "server.js"]
