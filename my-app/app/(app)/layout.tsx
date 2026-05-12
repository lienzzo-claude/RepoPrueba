import { redirect } from "next/navigation"
import Link from "next/link"

import { getSession } from "@/server/auth"
import { SignOutButton } from "@/components/sign-out-button"
import { AppNav } from "@/components/app-nav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/sign-in")

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/dashboard" className="text-sm font-medium">
            Finanzas
          </Link>
          <AppNav />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden md:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  )
}
