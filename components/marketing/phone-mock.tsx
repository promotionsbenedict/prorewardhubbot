import { Check, Flame, Gift, Zap } from "lucide-react"

export function PhoneMock() {
  return (
    <div className="relative w-[280px] shrink-0 sm:w-[320px]">
      <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/25 to-accent/20 blur-2xl" />
      <div className="rounded-[2.5rem] border border-border bg-card p-3 shadow-2xl shadow-primary/10">
        <div className="overflow-hidden rounded-[2rem] bg-background">
          <div className="flex items-center justify-between bg-gradient-to-br from-primary to-accent px-5 pb-6 pt-5 text-primary-foreground">
            <div>
              <p className="text-xs/none opacity-80">Good evening</p>
              <p className="mt-1 font-display text-lg font-bold">Amara</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-background/20 px-3 py-1.5 text-sm font-semibold backdrop-blur">
              <Flame className="size-4" />6
            </div>
          </div>

          <div className="-mt-4 space-y-3 rounded-t-2xl bg-background p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[11px] text-muted-foreground">Points</p>
                <p className="font-display text-xl font-bold text-foreground">4,820</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[11px] text-muted-foreground">Pro Score</p>
                <p className="font-display text-xl font-bold text-foreground">74</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Today&apos;s Drop</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                  3 of 5
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <MockMission icon={<Check className="size-3.5" />} label="Daily Check-in" done />
                <MockMission icon={<Zap className="size-3.5" />} label="Visit Nova Finance" done />
                <MockMission icon={<Gift className="size-3.5" />} label="Enter Launch Code" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/15 to-accent/15 p-3.5">
              <div>
                <p className="text-sm font-semibold text-foreground">Reward ready</p>
                <p className="text-[11px] text-muted-foreground">$10 Gift Voucher</p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                Claim
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockMission({ icon, label, done }: { icon: React.ReactNode; label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid size-6 place-items-center rounded-full ${
          done ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className={`text-xs ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{label}</span>
    </div>
  )
}
