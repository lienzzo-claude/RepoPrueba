"use server"
import "server-only"

import { and, eq, gte, lte, sql } from "drizzle-orm"

import { db } from "@/db"
import { categories, movements } from "@/db/schema"
import { requireUser } from "@/server/auth"
import { addMonthsToKey, monthRange, toMonthKey } from "@/lib/date"

export type MonthlyTotals = {
  income: number
  expenses: number
  net: number
  monthKey: string
}

export type CategoryExpense = {
  categoryId: string | null
  name: string
  color: string
  total: number
  percentage: number
}

export type MonthlyTrendPoint = {
  month: string // "YYYY-MM"
  label: string
  income: number
  expenses: number
}

const SHORT_MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
]

function labelForMonthKey(monthKey: string): string {
  const month = Number(monthKey.slice(5, 7))
  return SHORT_MONTHS_ES[month - 1] ?? monthKey
}

function currentMonthKey() {
  return toMonthKey(new Date())
}

export async function getMonthlyTotals(
  monthKey: string = currentMonthKey(),
): Promise<MonthlyTotals> {
  const user = await requireUser()
  const { from, to } = monthRange(monthKey)

  const rows = await db
    .select({
      type: movements.type,
      total: sql<string>`coalesce(sum(${movements.amount}), 0)`,
    })
    .from(movements)
    .where(
      and(
        eq(movements.userId, user.id),
        gte(movements.date, from),
        lte(movements.date, to),
      ),
    )
    .groupBy(movements.type)

  let income = 0
  let expenses = 0
  for (const r of rows) {
    const n = Number(r.total)
    if (r.type === "INGRESO") income = n
    else if (r.type === "GASTO") expenses = n
  }

  return { income, expenses, net: income - expenses, monthKey }
}

export async function getExpensesByCategory(
  monthKey: string = currentMonthKey(),
): Promise<CategoryExpense[]> {
  const user = await requireUser()
  const { from, to } = monthRange(monthKey)

  const rows = await db
    .select({
      categoryId: movements.categoryId,
      name: categories.name,
      color: categories.color,
      total: sql<string>`coalesce(sum(${movements.amount}), 0)`,
    })
    .from(movements)
    .leftJoin(categories, eq(movements.categoryId, categories.id))
    .where(
      and(
        eq(movements.userId, user.id),
        eq(movements.type, "GASTO"),
        gte(movements.date, from),
        lte(movements.date, to),
      ),
    )
    .groupBy(movements.categoryId, categories.name, categories.color)
    .orderBy(sql`sum(${movements.amount}) desc`)

  const totals = rows.map((r) => ({
    categoryId: r.categoryId,
    name: r.name ?? "Sin categoría",
    color: r.color ?? "#94a3b8",
    total: Number(r.total),
  }))

  const sum = totals.reduce((acc, r) => acc + r.total, 0)
  return totals.map((r) => ({
    ...r,
    percentage: sum === 0 ? 0 : (r.total / sum) * 100,
  }))
}

export async function getMonthlyTrend(
  months = 6,
  endMonthKey: string = currentMonthKey(),
): Promise<MonthlyTrendPoint[]> {
  const user = await requireUser()
  const startKey = addMonthsToKey(endMonthKey, -(months - 1))
  const { from } = monthRange(startKey)
  const { to } = monthRange(endMonthKey)

  const rows = await db
    .select({
      bucket: sql<string>`to_char(${movements.date}, 'YYYY-MM')`,
      type: movements.type,
      total: sql<string>`coalesce(sum(${movements.amount}), 0)`,
    })
    .from(movements)
    .where(
      and(
        eq(movements.userId, user.id),
        gte(movements.date, from),
        lte(movements.date, to),
      ),
    )
    .groupBy(sql`to_char(${movements.date}, 'YYYY-MM')`, movements.type)

  // Inicializar con todos los meses a 0
  const byMonth = new Map<string, MonthlyTrendPoint>()
  for (let i = months - 1; i >= 0; i--) {
    const key = addMonthsToKey(endMonthKey, -i)
    byMonth.set(key, {
      month: key,
      label: labelForMonthKey(key),
      income: 0,
      expenses: 0,
    })
  }

  for (const r of rows) {
    const point = byMonth.get(r.bucket)
    if (!point) continue
    const n = Number(r.total)
    if (r.type === "INGRESO") point.income = n
    else point.expenses = n
  }

  return Array.from(byMonth.values())
}
