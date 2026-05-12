"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useMonthlyTrend } from "@/hooks/use-stats"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useDashboardMonth } from "./month-context"

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const config: ChartConfig = {
  income: { label: "Ingresos", color: "#10b981" },
  expenses: { label: "Gastos", color: "#ef4444" },
}

const MONTHS = 6

export function MonthlyTrendChart() {
  const { date } = useDashboardMonth()
  const { data, isLoading } = useMonthlyTrend(MONTHS, date)

  const endLabel = date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  const isEmpty =
    !isLoading &&
    (!data || data.every((d) => d.income === 0 && d.expenses === 0))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs. Gastos</CardTitle>
        <CardDescription className="capitalize">
          {MONTHS} meses hasta {endLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            Sin datos suficientes en este rango.
          </div>
        ) : (
          <ChartContainer config={config} className="h-[260px] w-full">
            <BarChart data={data ?? []} margin={{ top: 8, right: 8, left: -10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                className="text-xs capitalize"
              />
              <YAxis
                tickFormatter={(v) => eur.format(Number(v))}
                tickLine={false}
                axisLine={false}
                width={64}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground capitalize">
                          {name === "income" ? "Ingresos" : "Gastos"}
                        </span>
                        <span className="font-mono tabular-nums">
                          {eur.format(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="var(--color-expenses)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
