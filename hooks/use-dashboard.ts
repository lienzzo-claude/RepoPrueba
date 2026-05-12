"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

type Range = { from?: string; to?: string };

function rangeQuery(r: Range) {
  const p = new URLSearchParams();
  if (r.from) p.set("from", r.from);
  if (r.to) p.set("to", r.to);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export type Summary = {
  ingresos: number;
  gastos: number;
  balance: number;
  movimientos: number;
};

export type TimeseriesPoint = {
  bucket: string;
  ingresos: number;
  gastos: number;
};

export type CategorySlice = {
  category_id: string;
  category_name: string;
  category_color: string;
  total: number;
  movimientos: number;
};

export function useSummary(range: Range) {
  return useQuery({
    queryKey: ["dashboard", "summary", range],
    queryFn: () =>
      apiFetch<{ data: Summary }>(`/api/dashboard/summary${rangeQuery(range)}`),
    select: (r) => r.data,
  });
}

export function useTimeseries(
  granularity: "day" | "week" | "month",
  range: Range,
) {
  return useQuery({
    queryKey: ["dashboard", "timeseries", granularity, range],
    queryFn: () => {
      const params = new URLSearchParams({ granularity });
      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);
      return apiFetch<{ data: TimeseriesPoint[] }>(
        `/api/dashboard/timeseries?${params.toString()}`,
      );
    },
    select: (r) => r.data,
  });
}

export function useByCategory(type: "INGRESO" | "GASTO", range: Range) {
  return useQuery({
    queryKey: ["dashboard", "by-category", type, range],
    queryFn: () => {
      const params = new URLSearchParams({ type });
      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);
      return apiFetch<{ data: CategorySlice[] }>(
        `/api/dashboard/by-category?${params.toString()}`,
      );
    },
    select: (r) => r.data,
  });
}
