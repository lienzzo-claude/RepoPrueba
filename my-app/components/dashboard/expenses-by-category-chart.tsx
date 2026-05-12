"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"

import { useExpensesByCategory } from "@/hooks/use-stats"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
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

const eurDetailed = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
})

export function ExpensesByCategoryChart() {
  const { date } = useDashboardMonth()
  const { data, isLoading } = useExpensesByCategory(date)

  const monthLabel = date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  const chartData = (data ?? []).map((c) => ({
    name: c.name,
    value: c.total,
    color: c.color,
  }))

  const total = chartData.reduce((acc, c) => acc + c.value, 0)

  const config: ChartConfig = Object.fromEntries(
    chartData.map((c) => [c.name, { label: c.name, color: c.color }]),
  )

  const isEmpty = !isLoading && total === 0

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription className="capitalize">{monthLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {isEmpty ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Sin gastos registrados en este mes.
          </div>
        ) : (
          <>
            <ChartContainer
              config={config}
              className="mx-auto aspect-square max-h-[300px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-mono tabular-nums">
                            {eurDetailed.format(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="85%"
                  innerRadius={0}
                  strokeWidth={2}
                  stroke="var(--background)"
                  label={renderSliceLabel}
                  labelLine={false}
                  isAnimationActive
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
              {chartData.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-1.5"
                >
                  <span
                    aria-hidden
                    className="inline-block size-2 rounded-full"
                    style={{ background: c.color }}
                  />
                  <span className="text-muted-foreground">{c.name}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

type SliceLabelProps = {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  name: string
  value: number
  percent: number
}

function renderSliceLabel(props: unknown) {
  const p = props as SliceLabelProps
  if (p.percent < 0.05) return null // ocultar etiquetas en porciones < 5%

  const RADIAN = Math.PI / 180
  const radius = p.innerRadius + (p.outerRadius - p.innerRadius) * 0.6
  const x = p.cx + radius * Math.cos(-p.midAngle * RADIAN)
  const y = p.cy + radius * Math.sin(-p.midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      className="pointer-events-none"
      style={{ fontSize: 11, fontWeight: 600 }}
    >
      <tspan x={x} dy="-0.5em">
        {p.name}
      </tspan>
      <tspan x={x} dy="1.1em">
        {eur.format(p.value)}
      </tspan>
    </text>
  )
}
