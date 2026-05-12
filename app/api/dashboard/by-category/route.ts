import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "GASTO";
  if (type !== "INGRESO" && type !== "GASTO") {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const conditions: string[] = ["m.user_id = $1", "m.type = $2"];
  const params: unknown[] = [session.user.id, type];
  let i = 3;
  if (from) {
    conditions.push(`m.date >= $${i++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`m.date <= $${i++}`);
    params.push(to);
  }

  const { rows } = await pool.query(
    `SELECT
       COALESCE(c.id::text, 'sin-categoria') AS category_id,
       COALESCE(c.name, 'Sin categoría') AS category_name,
       COALESCE(c.color, '#94a3b8') AS category_color,
       SUM(m.amount)::float AS total,
       COUNT(*)::int AS movimientos
     FROM movements m
     LEFT JOIN categories c ON c.id = m.category_id
     WHERE ${conditions.join(" AND ")}
     GROUP BY 1, 2, 3
     ORDER BY total DESC`,
    params,
  );

  return NextResponse.json({ data: rows, type });
}
