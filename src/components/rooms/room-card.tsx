import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoomStatusBadge, CleaningStatusBadge } from '@/components/rooms/room-status-badge'
import { formatCurrency } from '@/lib/formatters'
import type { Room } from '@/types'

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={`/cabanas/${room.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{room.name}</CardTitle>
            <RoomStatusBadge status={room.status} />
          </div>
          {room.category && (
            <p className="text-sm text-muted-foreground">
              {room.category.name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {room.category && (
                <span className="font-medium text-foreground">
                  {formatCurrency(room.category.base_price)}
                </span>
              )}
              <span className="ml-1">/ noche</span>
            </div>
            <CleaningStatusBadge status={room.cleaning_status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
