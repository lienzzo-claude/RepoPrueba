"use client";

import { ArrowDownRight, ArrowUpRight, Scale, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummary } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/format";

export function KpiCards({
  range,
}: {
  range: { from?: string; to?: string };
}) {
  const { data, isLoading } = useSummary(range);

  const items = [
    {
      label: "Balance",
      value: data?.balance ?? 0,
      icon: Scale,
      tone: (data?.balance ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600",
    },
    {
      label: "Ingresos",
      value: data?.ingresos ?? 0,
      icon: ArrowUpRight,
      tone: "text-emerald-600",
    },
    {
      label: "Gastos",
      value: data?.gastos ?? 0,
      icon: ArrowDownRight,
      tone: "text-rose-600",
    },
    {
      label: "Movimientos",
      value: data?.movimientos ?? 0,
      icon: Wallet,
      tone: "text-foreground",
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                  {item.label}
                </div>
                {isLoading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <div className={`text-2xl font-semibold ${item.tone}`}>
                    {item.isCount
                      ? item.value
                      : formatCurrency(Number(item.value))}
                  </div>
                )}
              </div>
              <div className="bg-muted text-muted-foreground rounded-full p-2">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
