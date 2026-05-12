"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, MoreHorizontal, Search, X } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { MovementDialog } from "@/components/movement-dialog";
import { AddMovementButton } from "@/components/movement-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCategories } from "@/hooks/use-categories";
import {
  useDeleteMovement,
  useMovements,
} from "@/hooks/use-movements";
import { formatCurrency, formatDate, toIsoDate } from "@/lib/format";
import type { Movement } from "@/lib/validations/movements";

const ALL = "all";

export default function MovimientosPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const categories = useCategories();
  const [editing, setEditing] = useState<Movement | null>(null);

  const filters = useMemo(() => {
    const from = sp.get("from") ?? undefined;
    const to = sp.get("to") ?? undefined;
    const rawType = sp.get("type");
    const type: "INGRESO" | "GASTO" | undefined =
      rawType === "INGRESO" || rawType === "GASTO" ? rawType : undefined;
    const category_id = sp.get("category_id") ?? undefined;
    const q = sp.get("q") ?? undefined;
    const page = Number(sp.get("page") ?? "1");
    const pageSize = Number(sp.get("pageSize") ?? "20");
    return { from, to, type, category_id, q, page, pageSize };
  }, [sp]);

  const { data, isLoading, isFetching } = useMovements(filters);
  const del = useDeleteMovement();

  const [q, setQ] = useState(filters.q ?? "");

  useEffect(() => {
    setQ(filters.q ?? "");
  }, [filters.q]);

  const setParam = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      if (!("page" in patch)) next.delete("page");
      router.replace(`?${next.toString()}`);
    },
    [router, sp],
  );

  useEffect(() => {
    if (q === (filters.q ?? "")) return;
    const t = setTimeout(() => setParam({ q: q || undefined }), 300);
    return () => clearTimeout(t);
  }, [q, filters.q, setParam]);

  const clearFilters = () => router.replace("?");

  const totalPages = data
    ? Math.max(1, Math.ceil(data.pagination.total / data.pagination.pageSize))
    : 1;

  return (
    <>
      <AppHeader title="Movimientos" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Buscar concepto…"
                className="w-56 pl-8"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select
              value={filters.type ?? ALL}
              onValueChange={(v) =>
                setParam({ type: !v || v === ALL ? undefined : String(v) })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Tipo">
                  {(v: string) =>
                    v === "INGRESO" ? "Ingreso" : v === "GASTO" ? "Gasto" : "Todos"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                <SelectItem value="INGRESO">Ingreso</SelectItem>
                <SelectItem value="GASTO">Gasto</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category_id ?? ALL}
              onValueChange={(v) =>
                setParam({
                  category_id: !v || v === ALL ? undefined : String(v),
                })
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoría">
                  {(v: string) =>
                    !v || v === ALL
                      ? "Todas"
                      : (categories.data?.find((c) => c.id === v)?.name ??
                        "Categoría")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {categories.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker
              from={filters.from}
              to={filters.to}
              onChange={(from, to) => setParam({ from, to })}
            />
            {(filters.from ||
              filters.to ||
              filters.type ||
              filters.category_id ||
              filters.q) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" />
                Limpiar
              </Button>
            )}
          </div>
          <AddMovementButton />
        </div>

        {data && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SmallStat label="Ingresos" value={data.totals.ingresos} tone="emerald" />
            <SmallStat label="Gastos" value={data.totals.gastos} tone="rose" />
            <SmallStat
              label="Balance"
              value={data.totals.balance}
              tone={data.totals.balance >= 0 ? "emerald" : "rose"}
            />
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !data || data.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-10 text-center"
                    >
                      Sin movimientos. Pulsa &quot;Añadir movimiento&quot; para
                      registrar el primero.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground text-sm tabular-nums">
                        {formatDate(m.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {m.concept}
                      </TableCell>
                      <TableCell>
                        {m.category_name ? (
                          <span className="inline-flex items-center gap-2 text-sm">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  m.category_color ?? "#94a3b8",
                              }}
                            />
                            {m.category_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Sin categoría
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            m.type === "INGRESO" ? "default" : "secondary"
                          }
                          className={
                            m.type === "INGRESO"
                              ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                              : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-300"
                          }
                        >
                          {m.type === "INGRESO" ? "Ingreso" : "Gasto"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold tabular-nums ${
                          m.type === "INGRESO"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {m.type === "INGRESO" ? "+" : "−"}
                        {formatCurrency(m.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" />}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditing(m)}
                            >
                              Editar
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t py-3">
            <div className="text-muted-foreground text-xs">
              {data?.pagination.total ?? 0} movimientos
              {isFetching && " · actualizando…"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() =>
                  setParam({ page: String(Math.max(1, filters.page - 1)) })
                }
              >
                Anterior
              </Button>
              <div className="text-xs tabular-nums">
                Página {filters.page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages}
                onClick={() =>
                  setParam({ page: String(filters.page + 1) })
                }
              >
                Siguiente
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>

      <MovementDialog
        editing={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
      />
    </>
  );
}

function SmallStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-muted-foreground text-xs uppercase tracking-wide">
          {label}
        </div>
        <div
          className={`text-lg font-semibold tabular-nums ${
            tone === "emerald" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {formatCurrency(value)}
        </div>
      </CardContent>
    </Card>
  );
}

function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from?: string;
  to?: string;
  onChange: (from: string | undefined, to: string | undefined) => void;
}) {
  const label =
    from && to
      ? `${formatDate(from)} – ${formatDate(to)}`
      : from
        ? `Desde ${formatDate(from)}`
        : to
          ? `Hasta ${formatDate(to)}`
          : "Rango de fechas";

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {label}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={{
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
          }}
          onSelect={(r) =>
            onChange(
              r?.from ? toIsoDate(r.from) : undefined,
              r?.to ? toIsoDate(r.to) : undefined,
            )
          }
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
