import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { RESERVATION_STATUSES } from '@/lib/constants'
import type { Reservation, ReservationStatus } from '@/types'

const statusVariant: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'success',
  checked_in: 'default',
  checked_out: 'secondary',
  cancelled: 'destructive',
  no_show: 'outline',
}

interface RecentReservationsProps {
  reservations: (Reservation & {
    guest?: { first_name: string; last_name: string } | null
    room?: { name: string } | null
  })[]
}

export function RecentReservations({ reservations }: RecentReservationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reservas recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay reservas recientes
          </p>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {reservation.guest
                      ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                      : 'Huesped desconocido'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reservation.room?.name ?? 'Sin cabana'} &middot;{' '}
                    {formatDate(reservation.check_in_date)} -{' '}
                    {formatDate(reservation.check_out_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium">
                    {formatCurrency(reservation.total)}
                  </span>
                  <Badge variant={statusVariant[reservation.status]}>
                    {RESERVATION_STATUSES[reservation.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
