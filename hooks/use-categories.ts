"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import type {
  Category,
  CategoryInput,
  CategoryUpdateInput,
} from "@/lib/validations/categories";

export const categoriesKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: () => apiFetch<{ data: Category[] }>("/api/categories"),
    select: (r) => r.data,
  });
}

function invalidateDependent(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: categoriesKeys.all });
  qc.invalidateQueries({ queryKey: ["movements"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      apiFetch<{ data: Category }>("/api/categories", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      toast.success("Categoría creada");
      invalidateDependent(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: CategoryUpdateInput & { id: string }) =>
      apiFetch<{ data: Category }>(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      toast.success("Categoría actualizada");
      invalidateDependent(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Categoría eliminada");
      invalidateDependent(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
