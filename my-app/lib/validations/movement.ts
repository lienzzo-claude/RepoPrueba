import { z } from "zod"

export const movementTypeSchema = z.enum(["INGRESO", "GASTO"])
export type MovementTypeInput = z.infer<typeof movementTypeSchema>

// Lo que valida el formulario en el cliente (la fecha es un Date que viene del
// date picker). El submit se transforma a string antes de enviarlo al server.
export const movementFormSchema = z.object({
  concept: z
    .string()
    .trim()
    .min(1, "El concepto es obligatorio")
    .max(120, "Máx. 120 caracteres"),
  amount: z
    .number({ error: "Importe inválido" })
    .positive("El importe debe ser mayor que 0")
    .refine((n) => Number.isFinite(n), "Importe inválido")
    .refine(
      (n) => Math.round(n * 100) / 100 === n,
      "Máx. 2 decimales",
    ),
  type: movementTypeSchema,
  categoryId: z.uuid("Selecciona una categoría"),
  date: z.date({ error: "Selecciona una fecha" }),
})
export type MovementFormValues = z.infer<typeof movementFormSchema>

// Lo que aceptan las server actions (date como YYYY-MM-DD, TZ-independiente).
const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")

export const createMovementSchema = movementFormSchema.extend({
  date: isoDateString,
})
export type CreateMovementInput = z.infer<typeof createMovementSchema>

export const updateMovementSchema = createMovementSchema.extend({
  id: z.uuid(),
})
export type UpdateMovementInput = z.infer<typeof updateMovementSchema>
