import { z } from "zod";

export const MOVEMENT_TYPES = ["INGRESO", "GASTO"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)");

export const movementSchema = z.object({
  type: z.enum(MOVEMENT_TYPES),
  concept: z.string().trim().min(1, "Concepto obligatorio").max(140),
  amount: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .refine((v) => Number.isFinite(v) && v >= 0, "Importe inválido"),
  category_id: z.string().uuid().nullable().optional(),
  date: isoDate,
});

export const movementUpdateSchema = movementSchema.partial();

export type MovementInput = z.infer<typeof movementSchema>;
export type MovementUpdateInput = z.infer<typeof movementUpdateSchema>;

export type Movement = {
  id: string;
  type: MovementType;
  concept: string;
  amount: number;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};

export const movementFiltersSchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  type: z.enum(MOVEMENT_TYPES).optional(),
  category_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(140).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export type MovementFilters = z.infer<typeof movementFiltersSchema>;
