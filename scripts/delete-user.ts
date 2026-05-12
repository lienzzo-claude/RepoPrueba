import { Pool } from "pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/delete-user.ts <email>");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, email, name, "createdAt" FROM "user" WHERE email = $1`,
      [email],
    );
    if (rows.length === 0) {
      console.log(`No user found with email ${email}`);
      return;
    }
    const user = rows[0];
    console.log("Deleting user:", user);

    await client.query("BEGIN");
    const m = await client.query(
      `DELETE FROM movements WHERE user_id = $1`,
      [user.id],
    );
    const c = await client.query(
      `DELETE FROM categories WHERE user_id = $1`,
      [user.id],
    );
    const s = await client.query(
      `DELETE FROM "session" WHERE "userId" = $1`,
      [user.id],
    );
    const a = await client.query(
      `DELETE FROM "account" WHERE "userId" = $1`,
      [user.id],
    );
    const u = await client.query(`DELETE FROM "user" WHERE id = $1`, [
      user.id,
    ]);
    await client.query("COMMIT");

    console.log(`  movements deleted: ${m.rowCount}`);
    console.log(`  categories deleted: ${c.rowCount}`);
    console.log(`  sessions deleted: ${s.rowCount}`);
    console.log(`  accounts deleted: ${a.rowCount}`);
    console.log(`  user deleted:     ${u.rowCount}`);
    console.log("Done. Re-register at /signup");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
