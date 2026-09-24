"use client"

import { useState, useTransition } from "react"
import { Pencil, Plus, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  AdminAchievementRow,
  AdminMissionRow,
  AdminStreakMilestoneRow,
} from "@/lib/catalog"
import {
  deleteAchievement,
  deleteMission,
  deleteStreakMilestone,
  saveAchievement,
  saveMission,
  saveStreakMilestone,
} from "@/app/actions/admin-catalog"

type Props = {
  missions: AdminMissionRow[]
  achievements: AdminAchievementRow[]
  milestones: AdminStreakMilestoneRow[]
}

const MISSION_TYPES = ["check-in", "visit", "quiz", "telegram", "code", "custom"]
const VERIFICATIONS = ["instant", "timed-visit", "telegram", "code"]
const METRICS = ["points", "missions", "streak", "referrals", "level"]

function fieldClass() {
  return "space-y-1.5"
}

export function CatalogManager({ missions, achievements, milestones }: Props) {
  return (
    <Tabs defaultValue="missions" className="space-y-6">
      <TabsList>
        <TabsTrigger value="missions">Missions ({missions.length})</TabsTrigger>
        <TabsTrigger value="achievements">Achievements ({achievements.length})</TabsTrigger>
        <TabsTrigger value="milestones">Streak Milestones ({milestones.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="missions" className="space-y-4">
        <MissionSection rows={missions} />
      </TabsContent>
      <TabsContent value="achievements" className="space-y-4">
        <AchievementSection rows={achievements} />
      </TabsContent>
      <TabsContent value="milestones" className="space-y-4">
        <MilestoneSection rows={milestones} />
      </TabsContent>
    </Tabs>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-success/15 text-success">Active</Badge>
  ) : (
    <Badge variant="secondary">Hidden</Badge>
  )
}

/* ---------------------------------- Missions --------------------------------- */

function MissionSection({ rows }: { rows: AdminMissionRow[] }) {
  const [editing, setEditing] = useState<AdminMissionRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDelete(id: string) {
    if (!confirm("Delete this mission? Members will no longer see it.")) return
    startTransition(async () => {
      await deleteMission(id)
    })
  }

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveMission(formData)
      if (res.ok) {
        setEditing(null)
        setCreating(false)
      } else {
        setError(res.message ?? "Something went wrong.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null) }}>
          <Plus className="size-4" /> New mission
        </Button>
      </div>

      {(creating || editing) && (
        <MissionForm
          key={editing?.id ?? "new"}
          row={editing}
          error={error}
          pending={isPending}
          onSubmit={onSubmit}
          onCancel={() => { setCreating(false); setEditing(null); setError(null) }}
        />
      )}

      <div className="space-y-3">
        {rows.map((m) => (
          <Card key={m.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{m.title}</p>
                <Badge variant="secondary">{m.type}</Badge>
                {m.required ? <Badge className="bg-primary/10 text-primary">Required</Badge> : null}
                <StatusBadge active={m.active} />
              </div>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <p className="text-xs text-muted-foreground">
                {m.points} pts · {m.xp} XP · {m.verification}
                {m.durationSeconds ? ` · ${m.durationSeconds}s` : ""} · order {m.sortOrder}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(m); setCreating(false) }}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(m.id)} disabled={isPending}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No missions yet.</p>
        ) : null}
      </div>
    </div>
  )
}

function MissionForm({
  row,
  error,
  pending,
  onSubmit,
  onCancel,
}: {
  row: AdminMissionRow | null
  error: string | null
  pending: boolean
  onSubmit: (fd: FormData) => void
  onCancel: () => void
}) {
  return (
    <Card className="p-5">
      <form action={onSubmit} className="space-y-4">
        {row ? <input type="hidden" name="id" value={row.id} /> : null}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">{row ? "Edit mission" : "New mission"}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="size-4" />
          </Button>
        </div>

        <div className={fieldClass()}>
          <Label htmlFor="m-title">Title</Label>
          <Input id="m-title" name="title" defaultValue={row?.title} required />
        </div>
        <div className={fieldClass()}>
          <Label htmlFor="m-desc">Description</Label>
          <Input id="m-desc" name="description" defaultValue={row?.description} required />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className={fieldClass()}>
            <Label htmlFor="m-type">Type</Label>
            <select
              id="m-type"
              name="type"
              defaultValue={row?.type ?? "custom"}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {MISSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="m-verification">Verification</Label>
            <select
              id="m-verification"
              name="verification"
              defaultValue={row?.verification ?? "instant"}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {VERIFICATIONS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="m-cta">CTA label</Label>
            <Input id="m-cta" name="cta" defaultValue={row?.cta ?? "Start"} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="m-points">Points</Label>
            <Input id="m-points" name="points" type="number" defaultValue={row?.points ?? 0} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="m-xp">XP</Label>
            <Input id="m-xp" name="xp" type="number" defaultValue={row?.xp ?? 0} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="m-duration">Duration (s)</Label>
            <Input
              id="m-duration"
              name="durationSeconds"
              type="number"
              defaultValue={row?.durationSeconds ?? ""}
              placeholder="—"
            />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="m-order">Sort order</Label>
            <Input id="m-order" name="sortOrder" type="number" defaultValue={row?.sortOrder ?? 0} />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="required" defaultChecked={row?.required ?? false} className="size-4" />
            Required
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={row?.active ?? true} className="size-4" />
            Active
          </label>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </Card>
  )
}

/* -------------------------------- Achievements ------------------------------- */

function AchievementSection({ rows }: { rows: AdminAchievementRow[] }) {
  const [editing, setEditing] = useState<AdminAchievementRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDelete(id: string) {
    if (!confirm("Delete this achievement?")) return
    startTransition(async () => {
      await deleteAchievement(id)
    })
  }

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveAchievement(formData)
      if (res.ok) {
        setEditing(null)
        setCreating(false)
      } else {
        setError(res.message ?? "Something went wrong.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null) }}>
          <Plus className="size-4" /> New achievement
        </Button>
      </div>

      {(creating || editing) && (
        <AchievementForm
          key={editing?.id ?? "new"}
          row={editing}
          error={error}
          pending={isPending}
          onSubmit={onSubmit}
          onCancel={() => { setCreating(false); setEditing(null); setError(null) }}
        />
      )}

      <div className="space-y-3">
        {rows.map((a) => (
          <Card key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{a.title}</p>
                <Badge variant="secondary">{a.icon}</Badge>
                <StatusBadge active={a.active} />
              </div>
              <p className="text-sm text-muted-foreground">{a.description}</p>
              <p className="text-xs text-muted-foreground">
                +{a.points} pts · goal {a.goal} {a.metric} · order {a.sortOrder}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(a); setCreating(false) }}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(a.id)} disabled={isPending}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No achievements yet.</p>
        ) : null}
      </div>
    </div>
  )
}

function AchievementForm({
  row,
  error,
  pending,
  onSubmit,
  onCancel,
}: {
  row: AdminAchievementRow | null
  error: string | null
  pending: boolean
  onSubmit: (fd: FormData) => void
  onCancel: () => void
}) {
  return (
    <Card className="p-5">
      <form action={onSubmit} className="space-y-4">
        {row ? <input type="hidden" name="id" value={row.id} /> : null}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">{row ? "Edit achievement" : "New achievement"}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="size-4" />
          </Button>
        </div>

        <div className={fieldClass()}>
          <Label htmlFor="a-title">Title</Label>
          <Input id="a-title" name="title" defaultValue={row?.title} required />
        </div>
        <div className={fieldClass()}>
          <Label htmlFor="a-desc">Description</Label>
          <Input id="a-desc" name="description" defaultValue={row?.description} required />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className={fieldClass()}>
            <Label htmlFor="a-icon">Icon (lucide name)</Label>
            <Input id="a-icon" name="icon" defaultValue={row?.icon ?? "Trophy"} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="a-points">Reward points</Label>
            <Input id="a-points" name="points" type="number" defaultValue={row?.points ?? 0} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="a-metric">Metric</Label>
            <select
              id="a-metric"
              name="metric"
              defaultValue={row?.metric ?? "points"}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="a-goal">Goal</Label>
            <Input id="a-goal" name="goal" type="number" defaultValue={row?.goal ?? 1} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="a-order">Sort order</Label>
            <Input id="a-order" name="sortOrder" type="number" defaultValue={row?.sortOrder ?? 0} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={row?.active ?? true} className="size-4" />
          Active
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </Card>
  )
}

/* ------------------------------ Streak milestones ---------------------------- */

function MilestoneSection({ rows }: { rows: AdminStreakMilestoneRow[] }) {
  const [editing, setEditing] = useState<AdminStreakMilestoneRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDelete(id: string) {
    if (!confirm("Delete this milestone?")) return
    startTransition(async () => {
      await deleteStreakMilestone(id)
    })
  }

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveStreakMilestone(formData)
      if (res.ok) {
        setEditing(null)
        setCreating(false)
      } else {
        setError(res.message ?? "Something went wrong.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null) }}>
          <Plus className="size-4" /> New milestone
        </Button>
      </div>

      {(creating || editing) && (
        <MilestoneForm
          key={editing?.id ?? "new"}
          row={editing}
          error={error}
          pending={isPending}
          onSubmit={onSubmit}
          onCancel={() => { setCreating(false); setEditing(null); setError(null) }}
        />
      )}

      <div className="space-y-3">
        {rows.map((s) => (
          <Card key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">Day {s.day} — {s.label}</p>
                <StatusBadge active={s.active} />
              </div>
              <p className="text-xs text-muted-foreground">+{s.reward.toLocaleString()} points · order {s.sortOrder}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(s); setCreating(false) }}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(s.id)} disabled={isPending}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No milestones yet.</p>
        ) : null}
      </div>
    </div>
  )
}

function MilestoneForm({
  row,
  error,
  pending,
  onSubmit,
  onCancel,
}: {
  row: AdminStreakMilestoneRow | null
  error: string | null
  pending: boolean
  onSubmit: (fd: FormData) => void
  onCancel: () => void
}) {
  return (
    <Card className="p-5">
      <form action={onSubmit} className="space-y-4">
        {row ? <input type="hidden" name="id" value={row.id} /> : null}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">{row ? "Edit milestone" : "New milestone"}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="size-4" />
          </Button>
        </div>

        <div className={fieldClass()}>
          <Label htmlFor="s-label">Label</Label>
          <Input id="s-label" name="label" defaultValue={row?.label} required />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className={fieldClass()}>
            <Label htmlFor="s-day">Day</Label>
            <Input id="s-day" name="day" type="number" defaultValue={row?.day ?? 1} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="s-reward">Reward points</Label>
            <Input id="s-reward" name="reward" type="number" defaultValue={row?.reward ?? 0} />
          </div>
          <div className={fieldClass()}>
            <Label htmlFor="s-order">Sort order</Label>
            <Input id="s-order" name="sortOrder" type="number" defaultValue={row?.sortOrder ?? 0} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={row?.active ?? true} className="size-4" />
          Active
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </Card>
  )
}
