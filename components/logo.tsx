import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M12 2.5 4 8v8l8 5.5 8-5.5V8l-8-5.5Z"
          className="fill-background/15"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="m12 7 1.6 3.3 3.4.5-2.5 2.4.6 3.4L12 15.4 8.9 17l.6-3.4L7 11.2l3.4-.5L12 7Z" fill="currentColor" />
      </svg>
    </span>
  )
}

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showText && (
        <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
          Pro Reward Hub
        </span>
      )}
    </span>
  )
}
