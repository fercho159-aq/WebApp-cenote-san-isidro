import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROOM_STATUSES, CLEANING_STATUSES } from '@/lib/constants'
import type { RoomStatus, CleaningStatus } from '@/types'

const roomStatusColors: Record<RoomStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  occupied: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  maintenance: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  blocked: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

const cleaningStatusColors: Record<CleaningStatus, string> = {
  clean: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  dirty: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

interface RoomStatusBadgeProps {
  status: RoomStatus
  className?: string
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent font-medium',
        roomStatusColors[status],
        className
      )}
    >
      {ROOM_STATUSES[status]}
    </Badge>
  )
}

interface CleaningStatusBadgeProps {
  status: CleaningStatus
  className?: string
}

export function CleaningStatusBadge({ status, className }: CleaningStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent font-medium',
        cleaningStatusColors[status],
        className
      )}
    >
      {CLEANING_STATUSES[status]}
    </Badge>
  )
}
