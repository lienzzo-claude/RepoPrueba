"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Pencil } from "lucide-react"

import { useMovements } from "@/hooks/use-movements"
import type { MovementListItem } from "@/server/actions/movements"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MovementDialog } from "./movement-dialog"

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
})

export function MovementsTable() {
  const { data, isLoading, isError } = useMovements()
  const [editing, setEditing] = React.useState<MovementListItem | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando movimientos…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-destructive">
        Error al cargar los movimientos.
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        Aún no hay movimientos. Añade el primero con el botón “Añadir
        movimiento”.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((m) => {
              const isExpense = m.type === "GASTO"
              const amountNum = Number(m.amount)
              const signed = isExpense ? -amountNum : amountNum
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
                      isExpense ? "text-destructive" : "text-emerald-600",
                    )}
                  >
                    {isExpense ? "" : "+"}
                    {eur.format(signed)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar"
                      onClick={() => setEditing(m)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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
