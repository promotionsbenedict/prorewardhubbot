import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserRowActions } from "@/components/admin/user-row-actions"
import { getAdminContext, getAdminUsers } from "@/lib/admin"

export const dynamic = "force-dynamic"

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "PR"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default async function AdminUsersPage() {
  const [ctx, users] = await Promise.all([getAdminContext(), getAdminUsers()])
  const selfId = ctx.user?.id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} member{users.length === 1 ? "" : "s"} · manage roles and points balances.
        </p>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 lg:hidden">
        {users.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {initials(u.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{u.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                </div>
              </div>
              {u.role === "admin" ? (
                <Badge className="shrink-0 bg-primary/15 text-primary">Admin</Badge>
              ) : (
                <Badge variant="secondary" className="shrink-0">
                  Member
                </Badge>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {(u.points ?? 0).toLocaleString()} pts
              </span>
              <span>{(u.xp ?? 0).toLocaleString()} XP</span>
              <span>Joined {formatDate(u.createdAt)}</span>
            </div>
            <div className="mt-4 border-t border-border/60 pt-4">
              <UserRowActions userId={u.id} role={u.role} isSelf={u.id === selfId} />
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 text-right font-medium">Points</th>
              <th className="px-5 py-3 text-right font-medium">XP</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/40 last:border-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {initials(u.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {u.role === "admin" ? (
                    <Badge className="bg-primary/15 text-primary">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Member</Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-right font-medium text-foreground">
                  {(u.points ?? 0).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-right text-muted-foreground">
                  {(u.xp ?? 0).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-4">
                  <UserRowActions userId={u.id} role={u.role} isSelf={u.id === selfId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
