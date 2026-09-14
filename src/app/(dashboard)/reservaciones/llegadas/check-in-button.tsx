'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateReservationStatus } from '@/actions/reservations'
import { LogIn, Loader2 } from 'lucide-react'

export function ArrivalCheckInButton({
  reservationId,
}: {
  reservationId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleCheckIn = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateReservationStatus(reservationId, 'checked_in')
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        onClick={handleCheckIn}
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
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
