import { pool } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/validations/categories";

export async function ensureDefaultCategories(userId: string) {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM categories WHERE user_id = $1",
    [userId],
  );
  if (Number(rows[0]?.count ?? 0) > 0) return;

  const values: string[] = [];
  const params: unknown[] = [];
  DEFAULT_CATEGORIES.forEach((c, i) => {
    const base = i * 4;
    values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, true)`);
    params.push(userId, c.name, c.color, c.icon);
  });

  await pool.query(
    `INSERT INTO categories (user_id, name, color, icon, is_default)
     VALUES ${values.join(", ")}
     ON CONFLICT (user_id, name) DO NOTHING`,
    params,
  );
}
