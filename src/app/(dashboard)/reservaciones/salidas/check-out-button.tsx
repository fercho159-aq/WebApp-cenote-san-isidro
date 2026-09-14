'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateReservationStatus } from '@/actions/reservations'
import { LogOut, Loader2, AlertTriangle } from 'lucide-react'

export function DepartureCheckOutButton({
  reservationId,
  hasBalance,
}: {
  reservationId: string
  hasBalance: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const handleCheckOut = () => {
    if (hasBalance && !confirming) {
      setConfirming(true)
      return
    }

    setError(null)
    setConfirming(false)
    startTransition(async () => {
      const result = await updateReservationStatus(
        reservationId,
        'checked_out'
      )
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          Tiene saldo pendiente
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleCheckOut}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Confirmar'
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={handleCheckOut}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        Check-out
      </Button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
