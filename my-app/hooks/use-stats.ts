"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getExpensesByCategory,
  getMonthlyTotals,
  getMonthlyTrend,
} from "@/server/actions/stats"
import { queryKeys } from "@/lib/query-keys"
import { toMonthKey } from "@/lib/date"

function resolveMonthKey(input?: Date | string): string {
  if (!input) return toMonthKey(new Date())
  return typeof input === "string" ? input : toMonthKey(input)
}

export function useMonthlyTotals(date?: Date | string) {
  const monthKey = resolveMonthKey(date)
  return useQuery({
    queryKey: queryKeys.stats.monthlyTotals(monthKey),
    queryFn: () => getMonthlyTotals(monthKey),
  })
}

export function useExpensesByCategory(date?: Date | string) {
  const monthKey = resolveMonthKey(date)
  return useQuery({
    queryKey: queryKeys.stats.byCategory(monthKey),
    queryFn: () => getExpensesByCategory(monthKey),
  })
}

export function useMonthlyTrend(months = 6, endDate?: Date | string) {
  const endMonthKey = resolveMonthKey(endDate)
  return useQuery({
    queryKey: queryKeys.stats.trend(months, endMonthKey),
    queryFn: () => getMonthlyTrend(months, endMonthKey),
  })
}
