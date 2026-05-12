"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { MovementDialog } from "@/components/movement-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteMovement, useMovements } from "@/hooks/use-movements";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Movement } from "@/lib/validations/movements";

export function RecentMovements() {
  const { data, isLoading } = useMovements({ page: 1, pageSize: 6 });
  const del = useDeleteMovement();
  const [editing, setEditing] = useState<Movement | null>(null);
  const [duplicating, setDuplicating] = useState<Movement | null>(null);

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
                <div className="flex shrink-0 items-center gap-1">
                  <div
                    className={`text-sm font-semibold tabular-nums ${
                      m.type === "INGRESO"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {m.type === "INGRESO" ? "+" : "−"}
                    {formatCurrency(m.amount)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" />}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(m)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDuplicating(m)}>
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (confirm("¿Eliminar este movimiento?")) {
                            del.mutate(m.id);
                          }
                        }}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <MovementDialog
        editing={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
      />
      <MovementDialog
        prefill={duplicating}
        open={!!duplicating}
        onOpenChange={(o) => !o && setDuplicating(null)}
      />
    </Card>
  );
}
