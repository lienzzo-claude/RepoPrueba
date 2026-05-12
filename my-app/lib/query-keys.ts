export const queryKeys = {
  movements: {
    all: ["movements"] as const,
    list: () => [...queryKeys.movements.all, "list"] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
    withStats: () => [...queryKeys.categories.all, "with-stats"] as const,
  },
  stats: {
    all: ["stats"] as const,
    monthlyTotals: (monthKey: string) =>
      [...queryKeys.stats.all, "monthly-totals", monthKey] as const,
    byCategory: (monthKey: string) =>
      [...queryKeys.stats.all, "by-category", monthKey] as const,
    trend: (months: number, endMonthKey: string) =>
      [...queryKeys.stats.all, "trend", months, endMonthKey] as const,
  },
}
