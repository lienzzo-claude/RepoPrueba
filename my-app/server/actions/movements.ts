"use server"
import "server-only"

import { revalidatePath } from "next/cache"
import { and, desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { categories, movements } from "@/db/schema"
import {
  createMovementSchema,
  updateMovementSchema,
  type CreateMovementInput,
  type UpdateMovementInput,
} from "@/lib/validations/movement"
import { requireUser } from "@/server/auth"

export type MovementListItem = {
  id: string
  concept: string
  amount: string
  type: "INGRESO" | "GASTO"
  date: string
  categoryId: string | null
  categoryName: string | null
  categoryColor: string | null
  categoryIcon: string | null
}

export async function listMovements(): Promise<MovementListItem[]> {
  const user = await requireUser()

  const rows = await db
    .select({
      id: movements.id,
      concept: movements.concept,
      amount: movements.amount,
      type: movements.type,
      date: movements.date,
      categoryId: movements.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(movements)
    .leftJoin(categories, eq(movements.categoryId, categories.id))
    .where(eq(movements.userId, user.id))
    .orderBy(desc(movements.date), desc(movements.createdAt))

  return rows
}

function revalidateMovementsConsumers() {
  revalidatePath("/dashboard")
  revalidatePath("/movimientos")
  revalidatePath("/categorias")
}

export async function createMovement(input: CreateMovementInput) {
  const user = await requireUser()
  const parsed = createMovementSchema.parse(input)

  const [inserted] = await db
    .insert(movements)
    .values({
      userId: user.id,
      concept: parsed.concept,
      amount: parsed.amount.toFixed(2),
      type: parsed.type,
      categoryId: parsed.categoryId,
      date: parsed.date,
    })
    .returning({ id: movements.id })

  revalidateMovementsConsumers()
  return { id: inserted.id }
}

export async function updateMovement(input: UpdateMovementInput) {
  const user = await requireUser()
  const parsed = updateMovementSchema.parse(input)

  const result = await db
    .update(movements)
    .set({
      concept: parsed.concept,
      amount: parsed.amount.toFixed(2),
      type: parsed.type,
      categoryId: parsed.categoryId,
      date: parsed.date,
      updatedAt: new Date(),
    })
    .where(and(eq(movements.id, parsed.id), eq(movements.userId, user.id)))
    .returning({ id: movements.id })

  if (result.length === 0) {
    throw new Error("Movimiento no encontrado")
  }

  revalidateMovementsConsumers()
}

export async function deleteMovement(id: string) {
  const user = await requireUser()
  await db
    .delete(movements)
    .where(and(eq(movements.id, id), eq(movements.userId, user.id)))
  revalidateMovementsConsumers()
}
