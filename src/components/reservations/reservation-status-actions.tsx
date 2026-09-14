'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateReservationStatus } from '@/actions/reservations'
import type { ReservationStatus } from '@/types'
import {
  CheckCircle,
  LogIn,
  LogOut,
  XCircle,
  Loader2,
} from 'lucide-react'

interface ReservationStatusActionsProps {
  reservationId: string
  currentStatus: ReservationStatus
}

export function ReservationStatusActions({
  reservationId,
  currentStatus,
}: ReservationStatusActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = (newStatus: string) => {
    setError(null)
    startTransition(async () => {
      const result = await updateReservationStatus(reservationId, newStatus)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus === 'pending' && (
        <>
          <Button
            onClick={() => handleStatusChange('confirmed')}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Confirmar
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleStatusChange('cancelled')}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Cancelar
          </Button>
        </>
      )}

      {currentStatus === 'confirmed' && (
        <>
          <Button
            onClick={() => handleStatusChange('checked_in')}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Check-in
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleStatusChange('cancelled')}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Cancelar
          </Button>
        </>
      )}

      {currentStatus === 'checked_in' && (
        <Button
          onClick={() => handleStatusChange('checked_out')}
          disabled={isPending}
          variant="outline"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Check-out
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
