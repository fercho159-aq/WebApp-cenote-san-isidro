import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoomStatusBadge, CleaningStatusBadge } from '@/components/rooms/room-status-badge'
import { cn } from '@/lib/utils'
import type { Room, RoomStatus } from '@/types'

const statusDot: Record<RoomStatus, string> = {
  available: 'bg-emerald-500',
  occupied: 'bg-red-500',
  maintenance: 'bg-blue-500',
  blocked: 'bg-gray-400',
}

interface RoomStatusGridProps {
  rooms: Room[]
}

export function RoomStatusGrid({ rooms }: RoomStatusGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estado de cabanas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0',
                    statusDot[room.status]
                  )}
                />
                <span className="text-sm font-medium truncate">
                  {room.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <RoomStatusBadge status={room.status} />
                <CleaningStatusBadge status={room.cleaning_status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
