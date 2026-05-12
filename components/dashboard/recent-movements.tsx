"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovements } from "@/hooks/use-movements";
import { formatCurrency, formatDate } from "@/lib/format";

export function RecentMovements() {
  const { data, isLoading } = useMovements({ page: 1, pageSize: 6 });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Últimos movimientos
        </CardTitle>
        <Link
          href="/movimientos"
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          Ver todos
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-5 pt-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-muted-foreground p-5 pt-0 text-sm">
            Aún no hay movimientos.
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {data.data.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-8 w-8 shrink-0 rounded-full border"
                    style={{
                      backgroundColor:
                        (m.category_color ?? "#94a3b8") + "20",
                      borderColor: m.category_color ?? "#94a3b8",
                    }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {m.concept}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {m.category_name ?? "Sin categoría"} ·{" "}
                      {formatDate(m.date)}
                    </div>
                  </div>
                </div>
                <div
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    m.type === "INGRESO"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {m.type === "INGRESO" ? "+" : "−"}
                  {formatCurrency(m.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
