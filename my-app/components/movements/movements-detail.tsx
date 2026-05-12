"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Pencil, Search, Trash2 } from "lucide-react"

import { useDeleteMovement, useMovements } from "@/hooks/use-movements"
import { useCategories } from "@/hooks/use-categories"
import type { MovementListItem } from "@/server/actions/movements"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MovementDialog } from "./movement-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
})

type TypeFilter = "ALL" | "INGRESO" | "GASTO"
type CategoryFilter = string // "ALL" | <uuid>

export function MovementsDetail() {
  const { data, isLoading } = useMovements()
  const categoriesQuery = useCategories()
  const deleteMutation = useDeleteMovement()

  const [type, setType] = React.useState<TypeFilter>("ALL")
  const [categoryId, setCategoryId] = React.useState<CategoryFilter>("ALL")
  const [search, setSearch] = React.useState("")
  const [editing, setEditing] = React.useState<MovementListItem | null>(null)

  const filtered = React.useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.filter((m) => {
      if (type !== "ALL" && m.type !== type) return false
      if (categoryId !== "ALL" && m.categoryId !== categoryId) return false
      if (q && !m.concept.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, type, categoryId, search])

  const totals = React.useMemo(() => {
    let income = 0
    let expenses = 0
    for (const m of filtered) {
      const n = Number(m.amount)
      if (m.type === "INGRESO") income += n
      else expenses += n
    }
    return { income, expenses, net: income - expenses }
  }, [filtered])

  return (
    <>
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por concepto…"
            className="pl-8"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as TypeFilter)}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los tipos</SelectItem>
            <SelectItem value="GASTO">Gastos</SelectItem>
            <SelectItem value="INGRESO">Ingresos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="min-w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {categoriesQuery.data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block size-2 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 text-sm">
        <SummaryBar
          label="Ingresos"
          value={eur.format(totals.income)}
          tone="positive"
        />
        <SummaryBar
          label="Gastos"
          value={eur.format(totals.expenses)}
          tone="negative"
        />
        <SummaryBar
          label="Balance"
          value={eur.format(totals.net)}
          tone={totals.net >= 0 ? "positive" : "negative"}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          No hay movimientos con esos filtros.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const isExpense = m.type === "GASTO"
                const amountNum = Number(m.amount)
                return (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(m.date), "d MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="font-medium">{m.concept}</TableCell>
                    <TableCell>
                      {m.categoryName ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden
                            className="inline-block size-2 rounded-full"
                            style={{
                              background: m.categoryColor ?? "#94a3b8",
                            }}
                          />
                          <span className="text-sm">{m.categoryName}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono tabular-nums",
                        isExpense
                          ? "text-destructive"
                          : "text-emerald-600",
                      )}
                    >
                      {isExpense ? "" : "+"}
                      {eur.format(isExpense ? -amountNum : amountNum)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditing(m)}
                          aria-label="Editar"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteMutation.mutate(m.id)}
                          disabled={
                            deleteMutation.isPending &&
                            deleteMutation.variables === m.id
                          }
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>

    {editing && (
      <MovementDialog
        mode="edit"
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        movement={{
          id: editing.id,
          concept: editing.concept,
          amount: Number(editing.amount),
          type: editing.type,
          categoryId: editing.categoryId ?? "",
          date: new Date(editing.date),
        }}
      />
    )}
    </>
  )
}

function SummaryBar({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "positive" | "negative"
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          tone === "positive" ? "text-emerald-600" : "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  )
}
