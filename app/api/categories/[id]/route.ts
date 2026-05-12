import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { pool } from "@/lib/db";
import { categoryUpdateSchema } from "@/lib/validations/categories";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteContext) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(body);
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

  try {
    const { rows } = await pool.query(
      `UPDATE categories SET ${updates.join(", ")}
       WHERE id = $${i++} AND user_id = $${i}
       RETURNING id, name, color, icon, is_default, created_at, updated_at`,
      params,
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: rows[0] });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await ctx.params;
  const { rowCount } = await pool.query(
    `DELETE FROM categories WHERE id = $1 AND user_id = $2`,
    [id, session.user.id],
  );
  if (!rowCount) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
