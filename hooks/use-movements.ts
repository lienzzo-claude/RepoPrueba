"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import type {
  Movement,
  MovementFilters,
  MovementInput,
  MovementUpdateInput,
} from "@/lib/validations/movements";

export const movementsKeys = {
  all: ["movements"] as const,
  list: (filters: Partial<MovementFilters>) =>
    ["movements", "list", filters] as const,
};

export type MovementsResponse = {
  data: Movement[];
  pagination: { page: number; pageSize: number; total: number };
  totals: { ingresos: number; gastos: number; balance: number };
};

function buildQuery(filters: Partial<MovementFilters>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useMovements(filters: Partial<MovementFilters>) {
  return useQuery({
    queryKey: movementsKeys.list(filters),
    queryFn: () =>
      apiFetch<MovementsResponse>(`/api/movements${buildQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

function invalidateDependent(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: movementsKeys.all });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementInput) =>
      apiFetch<{ data: Movement }>("/api/movements", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      toast.success("Movimiento añadido");
      invalidateDependent(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: MovementUpdateInput & { id: string }) =>
      apiFetch<{ data: Movement }>(`/api/movements/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      toast.success("Movimiento actualizado");
      invalidateDependent(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/movements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Movimiento eliminado");
      invalidateDependent(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
