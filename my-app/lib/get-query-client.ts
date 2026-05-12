import "server-only"
import { cache } from "react"
import { QueryClient } from "@tanstack/react-query"

// Una QueryClient por request: `cache` la memoriza durante el render del request.
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
        },
      },
    }),
)
