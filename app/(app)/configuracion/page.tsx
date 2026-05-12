"use client";

import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CURRENCY, LOCALE } from "@/lib/format";
import { signOut, useSession } from "@/lib/auth-client";

export default function ConfiguracionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <AppHeader title="Configuración" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
            <CardDescription>Datos de la sesión actual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Email: </span>
              <strong>{session?.user.email ?? "—"}</strong>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Nombre: </span>
              <strong>{session?.user.name ?? "—"}</strong>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                router.push("/login");
                router.refresh();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Tema</div>
                <div className="text-muted-foreground text-xs">
                  Claro u oscuro (atajo: tecla D)
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                {resolvedTheme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" /> Claro
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" /> Oscuro
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Moneda</div>
                <div className="text-muted-foreground text-xs">
                  Formato de visualización
                </div>
              </div>
              <div className="text-sm font-mono">
                {CURRENCY} ({LOCALE})
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
