"use client"

import * as React from "react"

import { startOfMonth } from "@/lib/date"

type Ctx = {
  date: Date
  setDate: React.Dispatch<React.SetStateAction<Date>>
}

const MonthContext = React.createContext<Ctx | null>(null)

export function DashboardMonthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [date, setDate] = React.useState<Date>(() => startOfMonth(new Date()))
  const value = React.useMemo(() => ({ date, setDate }), [date])
  return (
    <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
  )
}

export function useDashboardMonth(): Ctx {
  const ctx = React.useContext(MonthContext)
  if (!ctx) {
    throw new Error(
      "useDashboardMonth debe usarse dentro de <DashboardMonthProvider>",
    )
  }
  return ctx
}
