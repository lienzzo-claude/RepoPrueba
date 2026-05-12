import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { pool } from "@/lib/db";
import { movementUpdateSchema } from "@/lib/validations/movements";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteContext) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = movementUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === undefined) continue;
    updates.push(`${key} = $${i++}`);
    params.push(value);
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }
  params.push(id, session.user.id);

  const { rows } = await pool.query(
    `UPDATE movements SET ${updates.join(", ")}
     WHERE id = $${i++} AND user_id = $${i}
     RETURNING id, type, concept, amount::float AS amount, date::text AS date,
               category_id, created_at, updated_at`,
    params,
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ data: rows[0] });
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await ctx.params;
  const { rowCount } = await pool.query(
    `DELETE FROM movements WHERE id = $1 AND user_id = $2`,
    [id, session.user.id],
  );
  if (!rowCount) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
