"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import {
  categorySchema,
  type Category,
} from "@/lib/validations/categories";

const COLOR_PALETTE = [
  "#10b981",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#facc15",
  "#64748b",
];

type FormState = { name: string; color: string };

function initialForm(editing: Category | null | undefined): FormState {
  if (editing) return { name: editing.name, color: editing.color };
  return { name: "", color: "#64748b" };
}

type Props = {
  editing?: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CategoryForm({
  editing,
  onClose,
}: {
  editing?: Category | null;
  onClose: () => void;
}) {
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const isEditing = !!editing;

  const [form, setForm] = useState<FormState>(() => initialForm(editing));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitting = create.isPending || update.isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = categorySchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    try {
      if (isEditing && editing) {
        await update.mutateAsync({ id: editing.id, ...parsed.data });
      } else {
        await create.mutateAsync(parsed.data);
      }
      onClose();
    } catch {
      // handled in hook toast
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="c-name">Nombre</Label>
        <Input
          id="c-name"
          placeholder="Ej. Supermercado"
          autoFocus
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({ ...f, name: e.target.value }))
          }
        />
        {errors.name && (
          <span className="text-destructive text-xs">{errors.name}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Color</Label>
        <div className="flex items-center gap-3">
          <span
            className="h-9 w-9 shrink-0 rounded-full border"
            style={{ backgroundColor: form.color }}
          />
          <Input
            type="text"
            className="w-32 font-mono uppercase"
            value={form.color}
            onChange={(e) =>
              setForm((f) => ({ ...f, color: e.target.value }))
            }
          />
        </div>
        <div className="mt-1 grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              className={`h-7 w-7 rounded-full border-2 transition ${
                form.color.toLowerCase() === c
                  ? "ring-ring border-foreground ring-2 ring-offset-2"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        {errors.color && (
          <span className="text-destructive text-xs">{errors.color}</span>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {isEditing ? "Guardar" : "Crear"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryDialog({ editing, open, onOpenChange }: Props) {
  const isEditing = !!editing;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <CategoryForm
            key={editing?.id ?? "new"}
            editing={editing}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva categoría
      </Button>
      <CategoryDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
