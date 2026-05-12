"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"

import {
  movementFormSchema,
  type MovementFormValues,
} from "@/lib/validations/movement"
import {
  useCreateMovement,
  useUpdateMovement,
} from "@/hooks/use-movements"
import { useCategories } from "@/hooks/use-categories"
import { cn } from "@/lib/utils"
import { toIsoDateLocal } from "@/lib/date"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type MovementFormDefaults = {
  id?: string
  concept: string
  amount: number
  type: "INGRESO" | "GASTO"
  categoryId: string
  date: Date
}

type Props = {
  mode: "create" | "edit"
  defaultValues?: MovementFormDefaults
  onSuccess?: () => void
  onCancel?: () => void
}

export function MovementForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
}: Props) {
  const categoriesQuery = useCategories()
  const createMutation = useCreateMovement()
  const updateMutation = useUpdateMovement()

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      concept: defaultValues?.concept ?? "",
      amount: defaultValues?.amount ?? (undefined as unknown as number),
      type: defaultValues?.type ?? "GASTO",
      categoryId: defaultValues?.categoryId ?? "",
      date: defaultValues?.date ?? new Date(),
    },
  })

  async function onSubmit(values: MovementFormValues) {
    // La fecha viaja como string YYYY-MM-DD formada con los componentes locales
    // del cliente → siempre coincide con la elegida en el calendario, sin
    // depender de la zona horaria del servidor.
    const payload = { ...values, date: toIsoDateLocal(values.date) }

    if (mode === "edit") {
      if (!defaultValues?.id) return
      await updateMutation.mutateAsync({ id: defaultValues.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
      form.reset()
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
          name="concept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input placeholder="p. ej. Compra Mercadona" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Importe (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                      field.onChange(v === "" ? undefined : Number(v))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GASTO">Gasto</SelectItem>
                    <SelectItem value="INGRESO">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={categoriesQuery.isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categoriesQuery.isLoading
                          ? "Cargando..."
                          : "Selecciona categoría"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesQuery.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="inline-block size-2 rounded-full"
                          style={{ background: c.color }}
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="grid">
              <FormLabel>Fecha</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {field.value
                        ? format(field.value, "PPP", { locale: es })
                        : "Selecciona fecha"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(d) => d && field.onChange(d)}
                    locale={es}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
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
            {mode === "edit" ? "Guardar cambios" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
