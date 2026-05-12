import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import type { Metadata } from "next"

import { CategoriesGrid } from "@/components/categories/categories-grid"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { listCategoriesWithStats } from "@/server/actions/categories"
import { getQueryClient } from "@/lib/get-query-client"
import { queryKeys } from "@/lib/query-keys"

export const metadata: Metadata = {
  title: "Categorías",
}

export default async function CategoriesPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories.withStats(),
    queryFn: () => listCategoriesWithStats(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Categorías</h1>
            <p className="text-sm text-muted-foreground">
              Distribución de tus gastos por categoría.
            </p>
          </div>
          <CategoryDialog mode="create" />
        </div>
        <CategoriesGrid />
      </div>
    </HydrationBoundary>
  )
}
