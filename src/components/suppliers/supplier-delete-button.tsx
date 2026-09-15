'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteSupplier } from '@/actions/suppliers'

export function SupplierDeleteButton({ id }: { id: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={async () => {
        if (!confirm('¿Estas seguro de eliminar este proveedor?')) return
        const result = await deleteSupplier(id)
        if (result?.error) {
          alert(result.error)
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Eliminar</span>
    </Button>
  )
}
