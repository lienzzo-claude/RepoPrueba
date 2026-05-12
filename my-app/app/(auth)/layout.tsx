import { redirect } from "next/navigation"

import { getSession } from "@/server/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (session) redirect("/dashboard")

  return <div className="flex min-h-svh items-center justify-center p-6">{children}</div>
}
