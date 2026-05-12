"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Algo ha ido mal</h2>
        <p className="text-sm text-muted-foreground">
          No hemos podido cargar el dashboard. Inténtalo de nuevo.
        </p>
      </div>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  )
}
