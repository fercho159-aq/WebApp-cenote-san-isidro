import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpenseDeleteButton } from '@/components/expenses/expense-delete-button'
import { formatCurrency } from '@/lib/formatters'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { Expense } from '@/types'

interface ExpenseTableProps {
  expenses: Expense[]
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Categoria
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Descripcion
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Proveedor
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Monto
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Metodo de pago
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatDateDisplay(expense.expense_date)}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                  {expense.category?.name ?? '-'}
                </span>
              </td>
              <td className="px-4 py-3 text-foreground">
                {expense.description}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {expense.supplier?.name ?? '-'}
              </td>
              <td className="px-4 py-3 text-right font-medium text-foreground whitespace-nowrap">
                {formatCurrency(Number(expense.amount))}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {expense.payment_method
                  ? PAYMENT_METHODS[
                      expense.payment_method as keyof typeof PAYMENT_METHODS
                    ] ?? expense.payment_method
                  : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/gastos/${expense.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                  <ExpenseDeleteButton id={expense.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
