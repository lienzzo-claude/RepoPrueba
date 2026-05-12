"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react"

import { useMonthlyTotals } from "@/hooks/use-stats"
import { addMonths, isSameMonth, startOfMonth } from "@/lib/date"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDashboardMonth } from "./month-context"

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
})

export function MonthlySummaryCards() {
  const { date, setDate } = useDashboardMonth()
  const { data, isLoading } = useMonthlyTotals(date)

  const today = startOfMonth(new Date())
  const isCurrentMonth = isSameMonth(date, today)

  const income = data?.income ?? 0
  const expenses = data?.expenses ?? 0
  const net = data?.net ?? 0

  const monthLabel = date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Resumen</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Mes anterior"
            onClick={() => setDate((d) => addMonths(d, -1))}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="min-w-[10ch] text-center text-sm font-medium capitalize">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Mes siguiente"
            disabled={isCurrentMonth}
            onClick={() => setDate((d) => addMonths(d, 1))}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Ingresos"
          value={eur.format(income)}
          icon={<ArrowUpRight className="size-4" />}
          tone="positive"
          loading={isLoading}
        />
        <StatCard
          label="Gastos"
          value={eur.format(expenses)}
          icon={<ArrowDownRight className="size-4" />}
          tone="negative"
          loading={isLoading}
        />
        <StatCard
          label="Balance"
          value={eur.format(net)}
          icon={<Wallet className="size-4" />}
          tone={net >= 0 ? "positive" : "negative"}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
  loading,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: "positive" | "negative"
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full",
              tone === "positive"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {icon}
          </span>
        </div>
        <div
          className={cn(
            "font-mono text-2xl font-semibold tabular-nums",
            tone === "positive" ? "text-emerald-600" : "text-destructive",
            loading && "opacity-40",
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
