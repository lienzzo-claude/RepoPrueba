"use client";

import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useByCategory } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/format";

export function CategoryDonut({
  range,
}: {
  range: { from?: string; to?: string };
}) {
  const [type, setType] = useState<"GASTO" | "INGRESO">("GASTO");
  const { data, isLoading } = useByCategory(type, range);

  const total = (data ?? []).reduce((s, c) => s + c.total, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">
            Distribución por categoría
          </CardTitle>
          <CardDescription>
            {type === "GASTO" ? "Gastos" : "Ingresos"} agrupados por categoría
          </CardDescription>
        </div>
        <Tabs
          value={type}
          onValueChange={(v) => setType(v as "GASTO" | "INGRESO")}
        >
          <TabsList>
            <TabsTrigger value="GASTO">Gastos</TabsTrigger>
            <TabsTrigger value="INGRESO">Ingresos</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
            Sin datos en este rango.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <ChartContainer config={{}} className="h-64 w-full lg:w-1/2">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      nameKey="category_name"
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category_name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {data.map((d) => (
                    <Cell
                      key={d.category_id}
                      fill={d.category_color}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="w-full space-y-2 lg:w-1/2">
              {data.slice(0, 8).map((c) => {
                const pct = total > 0 ? (c.total / total) * 100 : 0;
                return (
                  <li
                    key={c.category_id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: c.category_color }}
                      />
                      <span className="truncate">{c.category_name}</span>
                    </div>
                    <div className="text-muted-foreground shrink-0 tabular-nums">
                      {formatCurrency(c.total)}{" "}
                      <span className="text-xs">({pct.toFixed(0)}%)</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
