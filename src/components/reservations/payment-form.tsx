'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPayment } from '@/actions/payments'
import { PAYMENT_METHODS } from '@/lib/constants'
import { formatCurrency } from '@/lib/formatters'
import { Loader2, Plus } from 'lucide-react'

interface PaymentFormProps {
  reservationId: string
  balanceDue: number
}

export function PaymentForm({ reservationId, balanceDue }: PaymentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [amount, setAmount] = useState(balanceDue > 0 ? balanceDue : 0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await createPayment({
        reservationId,
        amount,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setAmount(0)
        setReferenceNumber('')
        setNotes('')
        router.refresh()
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          Pago registrado exitosamente.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="payment_amount">Monto</Label>
          <Input
            id="payment_amount"
            type="number"
            min={0.01}
            step={0.01}
            required
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
          {balanceDue > 0 && (
            <p className="text-xs text-muted-foreground">
              Saldo pendiente: {formatCurrency(balanceDue)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Metodo de pago</Label>
          <select
            id="payment_method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="payment_reference">Referencia (opcional)</Label>
          <Input
            id="payment_reference"
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="No. de referencia o autorizacion"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_notes">Notas (opcional)</Label>
          <textarea
            id="payment_notes"
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales..."
            className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || amount <= 0}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Registrar pago
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
