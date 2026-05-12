"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Loader2 } from "lucide-react"

import {
  categoryInputSchema,
  type CreateCategoryInput,
} from "@/lib/validations/category"
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/use-categories"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const COLOR_SWATCHES = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#64748b", // slate
  "#475569", // slate-darker
]

export type CategoryFormValues = CreateCategoryInput

type Props = {
  mode: "create" | "edit"
  defaultValues?: { id?: string; name: string; color: string }
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
}: Props) {
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      color: defaultValues?.color ?? COLOR_SWATCHES[9],
    },
  })

  async function onSubmit(values: CategoryFormValues) {
    if (mode === "edit") {
      if (!defaultValues?.id) return
      await updateMutation.mutateAsync({ id: defaultValues.id, ...values })
    } else {
      await createMutation.mutateAsync(values)
    }
    onSuccess?.()
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="p. ej. Supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="grid grid-cols-8 gap-2">
                  {COLOR_SWATCHES.map((c) => {
                    const selected = field.value === c
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => field.onChange(c)}
                        className={cn(
                          "relative inline-flex size-7 items-center justify-center rounded-full ring-offset-background transition-all",
                          selected
                            ? "ring-2 ring-foreground ring-offset-2"
                            : "hover:scale-110",
                        )}
                        style={{ background: c }}
                        aria-label={c}
                        aria-pressed={selected}
                      >
                        {selected && (
                          <Check className="size-3.5 text-white drop-shadow-sm" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-2 flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "edit" ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
