import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import {
  ReservationStatusBadge,
} from '@/components/reservations/status-badge'
import { getArrivals } from '@/actions/reservations'
import { formatDate } from '@/lib/formatters'
import type { Reservation, ReservationStatus } from '@/types'
import { LogIn, CalendarCheck, Plane } from 'lucide-react'
import Link from 'next/link'
import { ArrivalCheckInButton } from './check-in-button'

export default async function LlegadasPage() {
  const today = new Date().toISOString().split('T')[0]
  const arrivals = await getArrivals(today)

  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Llegadas de hoy"
        description={todayFormatted}
      >
        <Link href="/reservaciones/calendario">
          <Button variant="outline" size="sm">
            <CalendarCheck className="h-4 w-4" />
            Calendario
          </Button>
        </Link>
      </PageHeader>

      {arrivals.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="Sin llegadas hoy"
          description="No hay reservaciones con check-in programado para hoy."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {arrivals.length} llegada{arrivals.length !== 1 ? 's' : ''}{' '}
            esperada{arrivals.length !== 1 ? 's' : ''}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {arrivals.map((reservation: Reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link
                        href={`/reservaciones/${reservation.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {reservation.reservation_number}
                      </Link>
                      <p className="text-base font-semibold text-foreground">
                        {reservation.guest
                          ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                          : 'Huesped'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.room?.name || 'Sin cabana'}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <ReservationStatusBadge
                          status={reservation.status as ReservationStatus}
                        />
                        <span className="text-xs text-muted-foreground">
                          {reservation.nights} noche
                          {reservation.nights !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {reservation.status === 'confirmed' && (
                      <ArrivalCheckInButton reservationId={reservation.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
