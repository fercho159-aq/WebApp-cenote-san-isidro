'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Expense, ExpenseCategory, Supplier } from '@/types'

interface ExpenseFormProps {
  expense?: Expense
  categories: ExpenseCategory[]
  suppliers: Supplier[]
  action: (formData: FormData) => Promise<{ error: string } | void>
}

export function ExpenseForm({
  expense,
  categories,
  suppliers,
  action,
}: ExpenseFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await action(formData)
      if (result && 'error' in result) {
        return result
      }
      return null
    },
    null
  )

  const isEdit = !!expense

  // Format date for the input default value (YYYY-MM-DD)
  const defaultDate = expense?.expense_date
    ? expense.expense_date.substring(0, 10)
    : new Date().toISOString().substring(0, 10)

  const selectClass =
    'flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalle del gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={expense?.category_id ?? ''}
                required
                className={selectClass}
              >
                <option value="">Seleccionar categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Proveedor</Label>
              <select
                id="supplier_id"
                name="supplier_id"
                defaultValue={expense?.supplier_id ?? ''}
                className={selectClass}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descripcion *</Label>
              <Input
                id="description"
                name="description"
                placeholder="Descripcion del gasto"
                defaultValue={expense?.description ?? ''}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (MXN) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                defaultValue={expense?.amount ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_date">Fecha *</Label>
              <Input
                id="expense_date"
                name="expense_date"
                type="date"
                defaultValue={defaultDate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Metodo de pago</Label>
              <select
                id="payment_method"
                name="payment_method"
                defaultValue={expense?.payment_method ?? ''}
                className={selectClass}
              >
                <option value="">Seleccionar...</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                name="reference"
                placeholder="No. factura, recibo..."
                defaultValue={expense?.reference ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Observaciones o detalles adicionales..."
              defaultValue={expense?.notes ?? ''}
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending
            ? 'Guardando...'
            : isEdit
              ? 'Actualizar gasto'
              : 'Registrar gasto'}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gastos">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
