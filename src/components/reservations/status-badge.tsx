import { cn } from '@/lib/utils'
import { RESERVATION_STATUSES, PAYMENT_STATUSES } from '@/lib/constants'
import type { ReservationStatus, PaymentStatus } from '@/types'

const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  checked_in:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  checked_out:
    'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  no_show: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-500',
}

const paymentColors: Record<PaymentStatus, string> = {
  unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  partial:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export function ReservationStatusBadge({
  status,
  className,
}: {
  status: ReservationStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusColors[status],
        className
      )}
    >
      {RESERVATION_STATUSES[status]}
    </span>
  )
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        paymentColors[status],
        className
      )}
    >
      {PAYMENT_STATUSES[status]}
    </span>
  )
}
