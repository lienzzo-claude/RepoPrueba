import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="bg-muted/30 flex min-h-svh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
