"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement,
} from "@/server/actions/movements"
import type {
  CreateMovementInput,
  UpdateMovementInput,
} from "@/lib/validations/movement"
import { queryKeys } from "@/lib/query-keys"

export function useMovements() {
  return useQuery({
    queryKey: queryKeys.movements.list(),
    queryFn: () => listMovements(),
  })
}

export function useCreateMovement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMovementInput) => createMovement(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.movements.all })
      qc.invalidateQueries({ queryKey: queryKeys.stats.all })
      qc.invalidateQueries({ queryKey: queryKeys.categories.withStats() })
      toast.success("Movimiento añadido")
    },
    onError: (err) => {
      toast.error("No se pudo guardar", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    },
  })
}

export function useUpdateMovement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMovementInput) => updateMovement(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.movements.all })
      qc.invalidateQueries({ queryKey: queryKeys.stats.all })
      qc.invalidateQueries({ queryKey: queryKeys.categories.withStats() })
      toast.success("Movimiento actualizado")
    },
    onError: (err) => {
      toast.error("No se pudo actualizar", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    },
  })
}

export function useDeleteMovement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMovement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.movements.all })
      qc.invalidateQueries({ queryKey: queryKeys.stats.all })
      qc.invalidateQueries({ queryKey: queryKeys.categories.withStats() })
      toast.success("Movimiento eliminado")
    },
  })
}
