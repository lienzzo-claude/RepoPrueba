"use client";

import { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useCreateMovement, useUpdateMovement } from "@/hooks/use-movements";
import { formatDate, toIsoDate } from "@/lib/format";
import {
  movementSchema,
  type Movement,
  type MovementType,
} from "@/lib/validations/movements";

type FormState = {
  type: MovementType;
  concept: string;
  amount: string;
  category_id: string | null;
  date: string;
};

function initialForm(editing: Movement | null | undefined): FormState {
  if (editing) {
    return {
      type: editing.type,
      concept: editing.concept,
      amount: String(editing.amount),
      category_id: editing.category_id,
      date: editing.date.slice(0, 10),
    };
  }
  return {
    type: "GASTO",
    concept: "",
    amount: "",
    category_id: null,
    date: toIsoDate(new Date()),
  };
}

type Props = {
  editing?: Movement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MovementForm({ editing, onClose }: { editing?: Movement | null; onClose: () => void }) {
  const categories = useCategories();
  const create = useCreateMovement();
  const update = useUpdateMovement();
  const isEditing = !!editing;

  const [form, setForm] = useState<FormState>(() => initialForm(editing));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitting = create.isPending || update.isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = movementSchema.safeParse({
      ...form,
      amount: form.amount === "" ? 0 : Number(form.amount),
    });
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
        <Label htmlFor="m-type">Tipo</Label>
        <Select
          value={form.type}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, type: v as MovementType }))
          }
        >
          <SelectTrigger id="m-type" className="w-full">
            <SelectValue placeholder="Selecciona">
              {(v: string) =>
                v === "INGRESO" ? "Ingreso" : v === "GASTO" ? "Gasto" : "Selecciona"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INGRESO">Ingreso</SelectItem>
            <SelectItem value="GASTO">Gasto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="m-concept">Concepto</Label>
        <Input
          id="m-concept"
          placeholder="Ej. Compra Mercadona"
          value={form.concept}
          onChange={(e) =>
            setForm((f) => ({ ...f, concept: e.target.value }))
          }
        />
        {errors.concept && (
          <span className="text-destructive text-xs">{errors.concept}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="m-amount">Importe (€)</Label>
          <Input
            id="m-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: e.target.value }))
            }
          />
          {errors.amount && (
            <span className="text-destructive text-xs">{errors.amount}</span>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Fecha</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal"
                />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.date ? formatDate(form.date) : "Elegir"}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.date ? new Date(form.date) : undefined}
                onSelect={(d) =>
                  d && setForm((f) => ({ ...f, date: toIsoDate(d) }))
                }
                autoFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <span className="text-destructive text-xs">{errors.date}</span>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="m-category">Categoría</Label>
        <Select
          value={form.category_id ?? "none"}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              category_id: v === "none" ? null : String(v),
            }))
          }
        >
          <SelectTrigger id="m-category" className="w-full">
            <SelectValue placeholder="Sin categoría">
              {(v: string) =>
                !v || v === "none"
                  ? "Sin categoría"
                  : (categories.data?.find((c) => c.id === v)?.name ??
                    "Sin categoría")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin categoría</SelectItem>
            {categories.data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {isEditing ? "Guardar" : "Añadir"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function MovementDialog({ editing, open, onOpenChange }: Props) {
  const isEditing = !!editing;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar movimiento" : "Nuevo movimiento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos del movimiento."
              : "Registra un ingreso o un gasto."}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <MovementForm
            key={editing?.id ?? "new"}
            editing={editing}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddMovementButton({
  label = "Añadir movimiento",
}: {
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {label}
      </Button>
      <MovementDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
