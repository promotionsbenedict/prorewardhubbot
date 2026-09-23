export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function LegalLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-16 sm:px-6">{children}</div>
}
