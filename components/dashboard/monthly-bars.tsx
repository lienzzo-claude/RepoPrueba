"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTimeseries } from "@/hooks/use-dashboard";
import { formatCompactCurrency, formatMonth } from "@/lib/format";

const config: ChartConfig = {
  ingresos: { label: "Ingresos", color: "var(--chart-positive)" },
  gastos: { label: "Gastos", color: "var(--chart-negative)" },
};

export function MonthlyBars({
  range,
}: {
  range: { from?: string; to?: string };
}) {
  const { data, isLoading } = useTimeseries("month", range);
  const chartData = useMemo(
    () =>
      (data ?? []).map((p) => ({
        ...p,
        label: formatMonth(p.bucket),
      })),
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Comparativa mensual
        </CardTitle>
        <CardDescription>Ingresos vs gastos por mes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : chartData.length === 0 ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
            Sin datos.
          </div>
        ) : (
          <ChartContainer config={config} className="h-64 w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompactCurrency(Number(v))}
                tick={{ fontSize: 12 }}
                width={60}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span>
                        {String(name)}:{" "}
                        <strong>{formatCompactCurrency(Number(value))}</strong>
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="ingresos"
                fill="var(--chart-positive)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="gastos"
                fill="var(--chart-negative)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
