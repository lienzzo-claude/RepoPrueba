"use server"
import "server-only"

import { revalidatePath } from "next/cache"
import { and, asc, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { categories, movements } from "@/db/schema"
import { requireUser } from "@/server/auth"
import { monthRange, toMonthKey } from "@/lib/date"
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category"

export type CategoryOption = {
  id: string
  name: string
  color: string
  icon: string | null
  isDefault: boolean
}

export type CategoryWithStats = CategoryOption & {
  monthExpenses: number
  totalExpenses: number
  movementCount: number
}

export async function listCategories(): Promise<CategoryOption[]> {
  const user = await requireUser()

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
      isDefault: categories.isDefault,
    })
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(asc(categories.name))

  return rows
}

export async function listCategoriesWithStats(): Promise<CategoryWithStats[]> {
  const user = await requireUser()

  const { from, to } = monthRange(toMonthKey(new Date()))

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
      isDefault: categories.isDefault,
      monthExpenses: sql<string>`coalesce(sum(${movements.amount}) filter (
        where ${movements.type} = 'GASTO'
          and ${movements.date} between ${from} and ${to}
      ), 0)`,
      totalExpenses: sql<string>`coalesce(sum(${movements.amount}) filter (
        where ${movements.type} = 'GASTO'
      ), 0)`,
      movementCount: sql<number>`count(${movements.id})::int`,
    })
    .from(categories)
    .leftJoin(
      movements,
      and(
        eq(movements.categoryId, categories.id),
        eq(movements.userId, user.id),
      ),
    )
    .where(eq(categories.userId, user.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name))

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    icon: r.icon,
    isDefault: r.isDefault,
    monthExpenses: Number(r.monthExpenses),
    totalExpenses: Number(r.totalExpenses),
    movementCount: r.movementCount,
  }))
}

async function ensureNameAvailable(
  userId: string,
  name: string,
  excludeId?: string,
) {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        sql`lower(${categories.name}) = lower(${name})`,
      ),
    )
    .limit(1)

  if (existing[0] && existing[0].id !== excludeId) {
    throw new Error("Ya tienes una categoría con ese nombre")
  }
}

export async function createCategory(input: CreateCategoryInput) {
  const user = await requireUser()
  const parsed = createCategorySchema.parse(input)
  await ensureNameAvailable(user.id, parsed.name)

  const [inserted] = await db
    .insert(categories)
    .values({
      userId: user.id,
      name: parsed.name,
      color: parsed.color,
      isDefault: false,
    })
    .returning({ id: categories.id })

  revalidatePath("/categorias")
  revalidatePath("/dashboard")
  revalidatePath("/movimientos")
  return { id: inserted.id }
}

export async function updateCategory(input: UpdateCategoryInput) {
  const user = await requireUser()
  const parsed = updateCategorySchema.parse(input)
  await ensureNameAvailable(user.id, parsed.name, parsed.id)

  const result = await db
    .update(categories)
    .set({
      name: parsed.name,
      color: parsed.color,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, parsed.id), eq(categories.userId, user.id)))
    .returning({ id: categories.id })

  if (result.length === 0) {
    throw new Error("Categoría no encontrada")
  }

  revalidatePath("/categorias")
  revalidatePath("/dashboard")
  revalidatePath("/movimientos")
}

export async function deleteCategory(id: string) {
  const user = await requireUser()

  const [cat] = await db
    .select({ id: categories.id, isDefault: categories.isDefault })
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .limit(1)

  if (!cat) throw new Error("Categoría no encontrada")
  if (cat.isDefault) {
    throw new Error("No puedes eliminar una categoría por defecto")
  }

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))

  revalidatePath("/categorias")
  revalidatePath("/dashboard")
  revalidatePath("/movimientos")
}
