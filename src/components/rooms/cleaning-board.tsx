'use client'

import { useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from '@/components/rooms/room-status-badge'
import { updateCleaningStatus } from '@/actions/rooms'
import { cn } from '@/lib/utils'
import type { Room, CleaningStatus } from '@/types'

interface CleaningBoardProps {
  rooms: Room[]
}

const columns: { status: CleaningStatus; label: string; color: string }[] = [
  {
    status: 'clean',
    label: 'Limpia',
    color: 'border-t-emerald-500',
  },
  {
    status: 'dirty',
    label: 'Sucia',
    color: 'border-t-red-500',
  },
  {
    status: 'in_progress',
    label: 'En limpieza',
    color: 'border-t-amber-500',
  },
]

function CleaningRoomCard({
  room,
  targetStatuses,
}: {
  room: Room
  targetStatuses: { status: CleaningStatus; label: string }[]
}) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(newStatus: CleaningStatus) {
    startTransition(async () => {
      await updateCleaningStatus(room.id, newStatus)
    })
  }

  return (
    <Card className={cn('transition-opacity', isPending && 'opacity-50')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium text-sm">{room.name}</p>
            {room.category && (
              <p className="text-xs text-muted-foreground">{room.category.name}</p>
            )}
          </div>
          <RoomStatusBadge status={room.status} />
        </div>
        <div className="flex gap-1.5 mt-3">
          {targetStatuses.map((target) => (
            <Button
              key={target.status}
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange(target.status)}
              className="text-xs flex-1"
            >
              {target.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function CleaningBoard({ rooms }: CleaningBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {columns.map((column) => {
        const columnRooms = rooms.filter(
          (r) => r.cleaning_status === column.status
        )

        const targetStatuses = columns
          .filter((c) => c.status !== column.status)
          .map((c) => ({ status: c.status, label: c.label }))

        return (
          <div key={column.status}>
            <Card className={cn('border-t-4', column.color)}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{column.label}</span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {columnRooms.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnRooms.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Sin cabanas
                  </p>
                ) : (
                  columnRooms.map((room) => (
                    <CleaningRoomCard
                      key={room.id}
                      room={room}
                      targetStatuses={targetStatuses}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
