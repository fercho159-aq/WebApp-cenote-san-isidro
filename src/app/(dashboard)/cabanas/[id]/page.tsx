import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Baby,
  Wifi,
  DollarSign,
  CalendarDays,
  Pencil,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RoomStatusBadge, CleaningStatusBadge } from '@/components/rooms/room-status-badge'
import { RoomDetailActions } from '@/components/rooms/room-detail-actions'
import { DeleteRoomButton } from '@/components/rooms/delete-room-button'
import { getRoomById, getRoomReservations } from '@/actions/rooms'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { RESERVATION_STATUSES } from '@/lib/constants'
import type { ReservationStatus } from '@/types'

const statusVariant: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'success',
  checked_in: 'default',
  checked_out: 'secondary',
  cancelled: 'destructive',
  no_show: 'outline',
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [room, reservations] = await Promise.all([
    getRoomById(id),
    getRoomReservations(id),
  ])

  if (!room) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cabanas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {room.name}
            </h1>
            <RoomStatusBadge status={room.status} />
            <CleaningStatusBadge status={room.cleaning_status} />
          </div>
          {room.category && (
            <p className="text-sm text-muted-foreground mt-1">
              {room.category.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cabanas/${room.id}/editar`}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Link>
          </Button>
          <DeleteRoomButton roomId={room.id} roomName={room.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Room info */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles de la cabana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {room.category && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Max. adultos</p>
                        <p className="text-sm font-medium">{room.category.max_adults}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Baby className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Max. ninos</p>
                        <p className="text-sm font-medium">{room.category.max_children}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Precio base</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(room.category.base_price)} / noche
                      </p>
                    </div>
                  </div>

                  {room.category.amenities && room.category.amenities.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Amenidades</p>
                        <div className="flex flex-wrap gap-1.5">
                          {room.category.amenities.map((amenity) => (
                            <Badge
                              key={amenity}
                              variant="secondary"
                              className="text-xs"
                            >
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {room.category.description && (
                    <>
                      <Separator />
                      <p className="text-sm text-muted-foreground">
                        {room.category.description}
                      </p>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Reservations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Reservas actuales y proximas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay reservas programadas
                </p>
              ) : (
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {reservation.guest
                            ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                            : 'Huesped'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(reservation.check_in_date)} -{' '}
                          {formatDate(reservation.check_out_date)}
                        </p>
                      </div>
                      <Badge variant={statusVariant[reservation.status as ReservationStatus]}>
                        {RESERVATION_STATUSES[reservation.status as ReservationStatus]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Actions */}
        <RoomDetailActions
          roomId={room.id}
          currentStatus={room.status}
          currentCleaningStatus={room.cleaning_status}
          currentNotes={room.notes}
        />
      </div>
    </div>
  )
}
