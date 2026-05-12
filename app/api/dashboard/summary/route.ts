import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const url = new URL(req.url);
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
       COALESCE(SUM(CASE WHEN type = 'INGRESO' THEN amount ELSE 0 END), 0)::float AS ingresos,
       COALESCE(SUM(CASE WHEN type = 'GASTO' THEN amount ELSE 0 END), 0)::float AS gastos,
       COUNT(*)::int AS movimientos
     FROM movements
     WHERE ${conditions.join(" AND ")}`,
    params,
  );

  const ingresos = rows[0]?.ingresos ?? 0;
  const gastos = rows[0]?.gastos ?? 0;

  return NextResponse.json({
    data: {
      ingresos,
      gastos,
      balance: ingresos - gastos,
      movimientos: rows[0]?.movimientos ?? 0,
    },
  });
}
