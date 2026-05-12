import { sql } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  numeric,
  pgEnum,
  uuid,
  boolean,
  date,
  index,
} from "drizzle-orm/pg-core"

// 'user' la gestiona Better Auth. La declaramos sólo para las FK.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
})

// Coincide con el tipo existente en Postgres (mayúsculas, español).
export const movementType = pgEnum("movement_type", ["INGRESO", "GASTO"])

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#64748b"),
  icon: text("icon"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
})

export const movements = pgTable(
  "movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    type: movementType("type").notNull(),
    concept: text("concept").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (t) => ({
    userDateIdx: index("movements_user_date_idx").on(t.userId, t.date),
  }),
)

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Movement = typeof movements.$inferSelect
export type NewMovement = typeof movements.$inferInsert
export type MovementType = (typeof movementType.enumValues)[number]
