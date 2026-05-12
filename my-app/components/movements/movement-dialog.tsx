"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MovementForm,
  type MovementFormDefaults,
} from "./movement-form"

type CreateProps = { mode: "create" }
type EditProps = {
  mode: "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  movement: MovementFormDefaults & { id: string }
}

type Props = CreateProps | EditProps

export function MovementDialog(props: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isEdit = props.mode === "edit"

  const open = isEdit ? props.open : internalOpen
  const setOpen = isEdit ? props.onOpenChange : setInternalOpen

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Editar movimiento" : "Nuevo movimiento"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Actualiza los datos del movimiento."
            : "Registra un ingreso o gasto en tu cuenta."}
        </DialogDescription>
      </DialogHeader>
      <MovementForm
        mode={isEdit ? "edit" : "create"}
        defaultValues={isEdit ? props.movement : undefined}
        onSuccess={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </DialogContent>
  )

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Añadir movimiento
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  )
}
