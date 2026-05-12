import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { pool } from "@/lib/db";
import { ensureDefaultCategories } from "@/lib/seed-categories";
import { categorySchema } from "@/lib/validations/categories";

export async function GET() {
  const { session, response } = await requireSession();
  if (!session) return response;

  await ensureDefaultCategories(session.user.id);

  const { rows } = await pool.query(
    `SELECT id, name, color, icon, is_default, created_at, updated_at
     FROM categories
     WHERE user_id = $1
     ORDER BY name ASC`,
    [session.user.id],
  );

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, color, icon } = parsed.data;
  try {
    const { rows } = await pool.query(
      `INSERT INTO categories (user_id, name, color, icon, is_default)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, name, color, icon, is_default, created_at, updated_at`,
      [session.user.id, name, color, icon ?? null],
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
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
