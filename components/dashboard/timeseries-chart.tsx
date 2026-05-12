"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeseries } from "@/hooks/use-dashboard";
import { formatCompactCurrency, formatDate, formatMonth } from "@/lib/format";

const config: ChartConfig = {
  ingresos: { label: "Ingresos", color: "var(--chart-positive)" },
  gastos: { label: "Gastos", color: "var(--chart-negative)" },
};

type Granularity = "day" | "week" | "month";

export function TimeseriesChart({
  range,
}: {
  range: { from?: string; to?: string };
}) {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const { data, isLoading } = useTimeseries(granularity, range);

  const chartData = useMemo(
    () =>
      (data ?? []).map((p) => ({
        bucket: p.bucket,
        label:
          granularity === "month" ? formatMonth(p.bucket) : formatDate(p.bucket),
        ingresos: p.ingresos,
        gastos: p.gastos,
      })),
    [data, granularity],
  );

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">
          Ingresos vs gastos
        </CardTitle>
        <Tabs
          value={granularity}
          onValueChange={(v) => setGranularity(v as Granularity)}
        >
          <TabsList>
            <TabsTrigger value="day">Diario</TabsTrigger>
            <TabsTrigger value="week">Semanal</TabsTrigger>
            <TabsTrigger value="month">Mensual</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : chartData.length === 0 ? (
          <div className="text-muted-foreground flex h-72 items-center justify-center text-sm">
            Aún no hay datos en este rango.
          </div>
        ) : (
          <ChartContainer config={config} className="h-72 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="ingresosFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-positive)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-positive)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gastosFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-negative)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-negative)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={20}
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
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="var(--chart-positive)"
                fill="url(#ingresosFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke="var(--chart-negative)"
                fill="url(#gastosFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
