import { auth } from "../lib/auth";

const EMAIL = "lienzzo.claude@gmail.com";
const PASSWORD = "test1234";
const NAME = "Lienzzo Claude";

async function main() {
  try {
    const result = await auth.api.signUpEmail({
      body: { email: EMAIL, password: PASSWORD, name: NAME },
    });
    console.log("✅ Usuario creado:", result.user.email);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exist")) {
      console.log("ℹ️  El usuario ya existe:", EMAIL);
      return;
    }
    console.error("❌ Error al crear el usuario:", msg);
    process.exitCode = 1;
  }
}

main().finally(() => process.exit());
