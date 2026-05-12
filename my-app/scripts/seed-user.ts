import { config } from "dotenv"
config()

const { auth } = await import("../lib/auth")
const { Pool } = await import("pg")

const email = "Lienzzo.claude@gmail.com"
const password = "12345"
const name = "Lienzzo"

async function ensureUser() {
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    })
    console.log(`Created user: ${result.user.email} (id=${result.user.id})`)
    return
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (!message.toLowerCase().includes("already")) {
      throw err
    }
    console.log(`User ${email} already exists — verifying password…`)
  }

  // User exists — try to sign in. If it fails, reset the password.
  try {
    await auth.api.signInEmail({ body: { email, password } })
    console.log("Sign-in succeeded — credentials are correct.")
    return
  } catch {
    console.log("Sign-in failed — resetting password to the requested value.")
  }

  // Reset the credential row directly. Better Auth stores the bcrypt-style
  // hash on the `account` row whose providerId = 'credential'.
  const ctx = await auth.$context
  const hash = await ctx.password.hash(password)

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const userRow = await pool.query<{ id: string }>(
    `SELECT id FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email],
  )
  if (userRow.rowCount === 0) {
    await pool.end()
    throw new Error("User row missing despite duplicate-email error.")
  }
  const userId = userRow.rows[0].id

  const update = await pool.query(
    `UPDATE "account" SET password = $1, "updatedAt" = NOW()
     WHERE "userId" = $2 AND "providerId" = 'credential'`,
    [hash, userId],
  )
  if (update.rowCount === 0) {
    await pool.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, 'credential', $1, $2, NOW(), NOW())`,
      [userId, hash],
    )
    console.log("Inserted credential account row.")
  } else {
    console.log("Updated credential password.")
  }
  await pool.end()

  await auth.api.signInEmail({ body: { email, password } })
  console.log("Sign-in now succeeds with the requested password.")
}

await ensureUser()
process.exit(0)
