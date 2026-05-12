import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import type { Metadata } from "next"

import { AddMovementDialog } from "@/components/movements/add-movement-dialog"
import { MovementsTable } from "@/components/movements/movements-table"
import { MonthlySummaryCards } from "@/components/dashboard/monthly-summary-cards"
import { ExpensesByCategoryChart } from "@/components/dashboard/expenses-by-category-chart"
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart"
import { DashboardMonthProvider } from "@/components/dashboard/month-context"
import { listCategories } from "@/server/actions/categories"
import { listMovements } from "@/server/actions/movements"
import {
  getExpensesByCategory,
  getMonthlyTotals,
  getMonthlyTrend,
} from "@/server/actions/stats"
import { getQueryClient } from "@/lib/get-query-client"
import { queryKeys } from "@/lib/query-keys"
import { toMonthKey } from "@/lib/date"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const queryClient = getQueryClient()
  const now = new Date()
  const monthKey = toMonthKey(now)

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.movements.list(),
      queryFn: () => listMovements(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => listCategories(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.stats.monthlyTotals(monthKey),
      queryFn: () => getMonthlyTotals(monthKey),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.stats.byCategory(monthKey),
      queryFn: () => getExpensesByCategory(monthKey),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.stats.trend(6, monthKey),
      queryFn: () => getMonthlyTrend(6, monthKey),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardMonthProvider>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Resumen de tus finanzas personales.
              </p>
            </div>
            <AddMovementDialog />
          </div>

          <MonthlySummaryCards />

          <div className="grid gap-4 lg:grid-cols-2">
            <ExpensesByCategoryChart />
            <MonthlyTrendChart />
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Movimientos recientes
            </h2>
            <MovementsTable />
          </section>
        </div>
      </DashboardMonthProvider>
    </HydrationBoundary>
  )
}
