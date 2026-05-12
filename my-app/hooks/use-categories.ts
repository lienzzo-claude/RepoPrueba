"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createCategory,
  deleteCategory,
  listCategories,
  listCategoriesWithStats,
  updateCategory,
} from "@/server/actions/categories"
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validations/category"
import { queryKeys } from "@/lib/query-keys"

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => listCategories(),
    staleTime: 5 * 60_000,
  })
}

export function useCategoriesWithStats() {
  return useQuery({
    queryKey: queryKeys.categories.withStats(),
    queryFn: () => listCategoriesWithStats(),
  })
}

function invalidateAllCategoryConsumers(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.categories.all })
  qc.invalidateQueries({ queryKey: queryKeys.movements.all })
  qc.invalidateQueries({ queryKey: queryKeys.stats.all })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      invalidateAllCategoryConsumers(qc)
      toast.success("Categoría creada")
    },
    onError: (err) => {
      toast.error("No se pudo crear", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategory(input),
    onSuccess: () => {
      invalidateAllCategoryConsumers(qc)
      toast.success("Categoría actualizada")
    },
    onError: (err) => {
      toast.error("No se pudo actualizar", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      invalidateAllCategoryConsumers(qc)
      toast.success("Categoría eliminada")
    },
    onError: (err) => {
      toast.error("No se pudo eliminar", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    },
  })
}
