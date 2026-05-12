import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border bg-card" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[420px] animate-pulse rounded-lg border bg-card" />
        <div className="h-[420px] animate-pulse rounded-lg border bg-card" />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando dashboard…
      </div>
    </div>
  )
}
