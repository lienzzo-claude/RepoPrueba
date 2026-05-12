import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { pool } from "@/lib/db";
import {
  movementFiltersSchema,
  movementSchema,
} from "@/lib/validations/movements";

export async function GET(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const url = new URL(req.url);
  const rawFilters = Object.fromEntries(url.searchParams.entries());
  const parsed = movementFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Filtros inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const f = parsed.data;

  const conditions: string[] = ["m.user_id = $1"];
  const params: unknown[] = [session.user.id];
  let i = 2;

  if (f.from) {
    conditions.push(`m.date >= $${i++}`);
    params.push(f.from);
  }
  if (f.to) {
    conditions.push(`m.date <= $${i++}`);
    params.push(f.to);
  }
  if (f.type) {
    conditions.push(`m.type = $${i++}`);
    params.push(f.type);
  }
  if (f.category_id) {
    conditions.push(`m.category_id = $${i++}`);
    params.push(f.category_id);
  }
  if (f.q) {
    conditions.push(`m.concept ILIKE $${i++}`);
    params.push(`%${f.q}%`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const offset = (f.page - 1) * f.pageSize;

  const dataParams = [...params, f.pageSize, offset];
  const dataQuery = `
    SELECT
      m.id, m.type, m.concept, m.amount::float AS amount, m.date::text AS date,
      m.category_id, m.created_at, m.updated_at,
      c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM movements m
    LEFT JOIN categories c ON c.id = m.category_id
    ${where}
    ORDER BY m.date DESC, m.created_at DESC
    LIMIT $${i++} OFFSET $${i}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total,
      COALESCE(SUM(CASE WHEN type = 'INGRESO' THEN amount ELSE 0 END), 0)::float AS ingresos,
      COALESCE(SUM(CASE WHEN type = 'GASTO' THEN amount ELSE 0 END), 0)::float AS gastos
    FROM movements m ${where}
  `;

  const [data, totals] = await Promise.all([
    pool.query(dataQuery, dataParams),
    pool.query(countQuery, params),
  ]);

  return NextResponse.json({
    data: data.rows,
    pagination: {
      page: f.page,
      pageSize: f.pageSize,
      total: totals.rows[0]?.total ?? 0,
    },
    totals: {
      ingresos: totals.rows[0]?.ingresos ?? 0,
      gastos: totals.rows[0]?.gastos ?? 0,
      balance: (totals.rows[0]?.ingresos ?? 0) - (totals.rows[0]?.gastos ?? 0),
    },
  });
}

export async function POST(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const body = await req.json().catch(() => null);
  const parsed = movementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { type, concept, amount, category_id, date } = parsed.data;

  const { rows } = await pool.query(
    `INSERT INTO movements (user_id, type, concept, amount, category_id, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, type, concept, amount::float AS amount, date::text AS date,
               category_id, created_at, updated_at`,
    [session.user.id, type, concept, amount, category_id ?? null, date],
  );

  return NextResponse.json({ data: rows[0] }, { status: 201 });
}
