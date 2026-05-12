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
import { CategoryForm } from "./category-form"

type CreateProps = {
  mode: "create"
}

type EditProps = {
  mode: "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  category: { id: string; name: string; color: string }
}

type Props = CreateProps | EditProps

export function CategoryDialog(props: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isEdit = props.mode === "edit"

  const open = isEdit ? props.open : internalOpen
  const setOpen = isEdit ? props.onOpenChange : setInternalOpen

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Editar categoría" : "Nueva categoría"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Actualiza el nombre y color de la categoría."
            : "Crea una categoría para clasificar tus movimientos."}
        </DialogDescription>
      </DialogHeader>
      <CategoryForm
        mode={isEdit ? "edit" : "create"}
        defaultValues={isEdit ? props.category : undefined}
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
          Nueva categoría
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  )
}
