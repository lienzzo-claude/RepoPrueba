import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import type { Metadata } from "next"

import { AddMovementDialog } from "@/components/movements/add-movement-dialog"
import { MovementsDetail } from "@/components/movements/movements-detail"
import { listCategories } from "@/server/actions/categories"
import { listMovements } from "@/server/actions/movements"
import { getQueryClient } from "@/lib/get-query-client"
import { queryKeys } from "@/lib/query-keys"

export const metadata: Metadata = {
  title: "Movimientos",
}

export default async function MovementsPage() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.movements.list(),
      queryFn: () => listMovements(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => listCategories(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Movimientos</h1>
            <p className="text-sm text-muted-foreground">
              Detalle completo con filtros y búsqueda.
            </p>
          </div>
          <AddMovementDialog />
        </div>
        <MovementsDetail />
      </div>
    </HydrationBoundary>
  )
}
