'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { voidPayment } from '@/actions/payments'
import { PAYMENT_METHODS } from '@/lib/constants'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import type { Payment, PaymentMethod } from '@/types'
import { Ban, Loader2 } from 'lucide-react'

interface PaymentListProps {
  payments: Payment[]
}

export function PaymentList({ payments }: PaymentListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [voidingId, setVoidingId] = useState<string | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [showVoidDialog, setShowVoidDialog] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVoid = (paymentId: string) => {
    if (!voidReason.trim()) {
      setError('Ingresa una razon para anular el pago.')
      return
    }

    setError(null)
    setVoidingId(paymentId)

    startTransition(async () => {
      const result = await voidPayment(paymentId, voidReason.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setShowVoidDialog(null)
        setVoidReason('')
        router.refresh()
      }
      setVoidingId(null)
    })
  }

  if (payments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No hay pagos registrados.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">Fecha</th>
              <th className="pb-2 font-medium text-muted-foreground">Monto</th>
              <th className="pb-2 font-medium text-muted-foreground">Metodo</th>
              <th className="pb-2 font-medium text-muted-foreground">
                Referencia
              </th>
              <th className="pb-2 font-medium text-muted-foreground">Estado</th>
              <th className="pb-2 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className={`border-b border-border/50 ${
                  payment.voided ? 'opacity-60' : ''
                }`}
              >
                <td className="py-3">
                  <span className={payment.voided ? 'line-through' : ''}>
                    {formatDateTime(payment.payment_date)}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`font-medium ${
                      payment.voided
                        ? 'line-through text-muted-foreground'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(payment.amount)}
                  </span>
                </td>
                <td className="py-3">
                  <span className={payment.voided ? 'line-through' : ''}>
                    {PAYMENT_METHODS[payment.payment_method as PaymentMethod] ||
                      payment.payment_method}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`text-muted-foreground ${payment.voided ? 'line-through' : ''}`}
                  >
                    {payment.reference_number || '-'}
                  </span>
                </td>
                <td className="py-3">
                  {payment.voided ? (
                    <Badge
                      variant="destructive"
                      className="text-xs"
                    >
                      Anulado
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs"
                    >
                      Activo
                    </Badge>
                  )}
                </td>
                <td className="py-3 text-right">
                  {!payment.voided && (
                    <>
                      {showVoidDialog === payment.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            placeholder="Razon de anulacion..."
                            className="h-8 w-40 rounded-md border border-border bg-surface px-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleVoid(payment.id)
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVoid(payment.id)}
                            disabled={isPending && voidingId === payment.id}
                            className="h-8 text-xs"
                          >
                            {isPending && voidingId === payment.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Anular'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowVoidDialog(null)
                              setVoidReason('')
                              setError(null)
                            }}
                            className="h-8 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowVoidDialog(payment.id)}
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Ban className="h-3 w-3" />
                          Anular
                        </Button>
                      )}
                    </>
                  )}
                  {payment.voided && payment.voided_reason && (
                    <span className="text-xs text-muted-foreground italic">
                      {payment.voided_reason}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
