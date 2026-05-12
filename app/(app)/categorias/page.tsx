"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { CategoryDialog, NewCategoryButton } from "@/components/category-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useDeleteCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/lib/validations/categories";

export default function CategoriasPage() {
  const { data, isLoading } = useCategories();
  const del = useDeleteCategory();
  const [editing, setEditing] = useState<Category | null>(null);

  return (
    <>
      <AppHeader title="Categorías" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex justify-end">
          <NewCategoryButton />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !data || data.length === 0 ? (
              <div className="text-muted-foreground p-10 text-center text-sm">
                Aún no hay categorías.
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {data.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-8 w-8 shrink-0 rounded-full border"
                        style={{
                          backgroundColor: c.color + "30",
                          borderColor: c.color,
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {c.name}
                          {c.is_default && (
                            <Badge variant="secondary" className="text-[10px]">
                              Predeterminada
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs font-mono">
                          {c.color}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" />}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(c)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (
                              confirm(
                                `¿Eliminar "${c.name}"? Los movimientos asociados quedarán sin categoría.`,
                              )
                            ) {
                              del.mutate(c.id);
                            }
                          }}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      <CategoryDialog
        editing={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
      />
    </>
  );
}
