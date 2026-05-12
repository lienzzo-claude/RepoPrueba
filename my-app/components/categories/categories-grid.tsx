"use client"

import * as React from "react"
import { Pencil, Tag, Trash2 } from "lucide-react"

import {
  useCategoriesWithStats,
  useDeleteCategory,
} from "@/hooks/use-categories"
import type { CategoryWithStats } from "@/server/actions/categories"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CategoryDialog } from "./category-dialog"

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
})

export function CategoriesGrid() {
  const { data, isLoading } = useCategoriesWithStats()
  const deleteMutation = useDeleteCategory()

  const [editing, setEditing] = React.useState<CategoryWithStats | null>(null)
  const [confirming, setConfirming] = React.useState<CategoryWithStats | null>(
    null,
  )

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-lg border bg-card"
          />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        No tienes categorías todavía.
      </div>
    )
  }

  const totalThisMonth = data.reduce((acc, c) => acc + c.monthExpenses, 0)

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((c) => {
          const pct =
            totalThisMonth === 0
              ? 0
              : (c.monthExpenses / totalThisMonth) * 100
          return (
            <Card key={c.id} className="group relative overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${c.color}1a`, color: c.color }}
                  >
                    <Tag className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <CardTitle className="truncate text-base">
                      {c.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {c.movementCount}{" "}
                      {c.movementCount === 1 ? "movimiento" : "movimientos"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {c.isDefault ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Por defecto
                    </span>
                  ) : null}
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar"
                      onClick={() => setEditing(c)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    {!c.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Eliminar"
                        onClick={() => setConfirming(c)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Row
                  label="Este mes"
                  value={eur.format(c.monthExpenses)}
                  muted={c.monthExpenses === 0}
                />
                <Row
                  label="Total histórico"
                  value={eur.format(c.totalExpenses)}
                  muted={c.totalExpenses === 0}
                />
                <div className="flex flex-col gap-1">
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pct.toFixed(1)}% del gasto del mes
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog de edición */}
      {editing && (
        <CategoryDialog
          mode="edit"
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          category={{ id: editing.id, name: editing.name, color: editing.color }}
        />
      )}

      {/* Confirmación de borrado */}
      <AlertDialog
        open={!!confirming}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.movementCount
                ? `Los ${confirming.movementCount} movimiento(s) que usan "${confirming.name}" quedarán sin categoría asignada.`
                : `Vas a eliminar "${confirming?.name}". Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirming) return
                deleteMutation.mutate(confirming.id, {
                  onSettled: () => setConfirming(null),
                })
              }}
              disabled={deleteMutation.isPending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}
