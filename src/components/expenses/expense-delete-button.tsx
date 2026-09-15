'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteExpense } from '@/actions/expenses'

export function ExpenseDeleteButton({ id }: { id: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={async () => {
        if (!confirm('¿Estas seguro de eliminar este gasto?')) return
        const result = await deleteExpense(id)
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
