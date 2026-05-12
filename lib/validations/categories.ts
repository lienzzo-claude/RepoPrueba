import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(60),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color hex inválido (#RRGGBB)")
    .default("#64748b"),
  icon: z.string().trim().max(40).optional().nullable(),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  color: string;
  icon: string;
}> = [
  { name: "Supermercado", color: "#10b981", icon: "shopping-cart" },
  { name: "Ocio", color: "#a855f7", icon: "party-popper" },
  { name: "Transporte", color: "#0ea5e9", icon: "car" },
  { name: "Vivienda", color: "#f59e0b", icon: "home" },
  { name: "Restaurantes", color: "#ef4444", icon: "utensils" },
  { name: "Salud", color: "#ec4899", icon: "heart-pulse" },
  { name: "Suscripciones", color: "#8b5cf6", icon: "repeat" },
  { name: "Salario", color: "#22c55e", icon: "briefcase" },
  { name: "Otros ingresos", color: "#14b8a6", icon: "trending-up" },
  { name: "Otros gastos", color: "#64748b", icon: "circle-dashed" },
];
