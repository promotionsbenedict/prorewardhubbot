import { NextResponse } from "next/server"

// Lightweight liveness probe for Docker/Caddy health checks.
// Intentionally does not touch the database so a transient DB blip
// does not flap the container's health status.
export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() })
}
