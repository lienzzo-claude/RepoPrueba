import { z } from "zod"

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal inválido (#RRGGBB)")

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(40, "Máx. 40 caracteres"),
  color: hexColor,
})

export const createCategorySchema = categoryInputSchema
export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = categoryInputSchema.extend({
  id: z.uuid(),
})
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
