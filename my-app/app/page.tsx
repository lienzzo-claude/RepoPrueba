import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getSession } from "@/server/auth"

export default async function Page() {
  const session = await getSession()
  if (session) redirect("/dashboard")

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex max-w-md flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold">Finanzas personales</h1>
        <p className="text-sm text-muted-foreground">
          Lleva el control de tus ingresos y gastos.
        </p>
        <div className="flex justify-center gap-2">
          <Button asChild>
            <Link href="/sign-in">Iniciar sesión</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-up">Crear cuenta</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
