import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { pool } from "@/lib/db";

const VALID_GRANULARITY = new Set(["day", "week", "month"]);

export async function GET(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const url = new URL(req.url);
  const granularity = url.searchParams.get("granularity") ?? "month";
  if (!VALID_GRANULARITY.has(granularity)) {
    return NextResponse.json({ error: "Granularidad inválida" }, { status: 400 });
  }
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const conditions: string[] = ["user_id = $1"];
  const params: unknown[] = [session.user.id];
  let i = 2;
  if (from) {
    conditions.push(`date >= $${i++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`date <= $${i++}`);
    params.push(to);
  }

  const { rows } = await pool.query(
    `SELECT
       to_char(date_trunc('${granularity}', date), 'YYYY-MM-DD') AS bucket,
       COALESCE(SUM(CASE WHEN type = 'INGRESO' THEN amount ELSE 0 END), 0)::float AS ingresos,
       COALESCE(SUM(CASE WHEN type = 'GASTO' THEN amount ELSE 0 END), 0)::float AS gastos
     FROM movements
     WHERE ${conditions.join(" AND ")}
     GROUP BY 1
     ORDER BY 1 ASC`,
    params,
  );

  return NextResponse.json({ data: rows, granularity });
}
